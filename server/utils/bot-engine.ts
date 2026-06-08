import type {
  Bot,
  BotPredictionRequest,
  BotPredictionResponse,
  BotRunResult,
  Match,
  MatchSide,
} from '~~/shared/types'

/**
 * The AI-bot engine. Talks to each bot's external prediction endpoint using the
 * built-in `$fetch`, then places bets on its behalf through the normal data
 * layer — so a bot is indistinguishable from a human on the leaderboard.
 */

/** Calls the bot's external endpoint and returns a validated home-win probability. */
export async function fetchPrediction(bot: Bot, match: Match): Promise<number> {
  const body: BotPredictionRequest = {
    date: match.date,
    home_team: match.homeTeam.name,
    away_team: match.awayTeam.name,
  }

  const response = await $fetch<BotPredictionResponse>(bot.apiUrl, {
    method: 'POST',
    body,
    headers: bot.apiKey ? { Authorization: `Bearer ${bot.apiKey}` } : undefined,
    timeout: 8_000,
  })

  const probability = Number(response?.home_team_winning_probability)
  if (!Number.isFinite(probability) || probability < 0 || probability > 1) {
    throw new Error(
      `Invalid probability from ${bot.apiUrl}: ${response?.home_team_winning_probability}`,
    )
  }
  return probability
}

/**
 * Translates a probability into a pick. Returns null when the probability sits
 * within `threshold` of a coin-flip, letting cautious bots abstain.
 */
export function decideBet(probability: number, threshold: number): MatchSide | null {
  if (Math.abs(probability - 0.5) < threshold) return null
  return probability >= 0.5 ? 'home' : 'away'
}

/** Runs a single bot across every upcoming match it hasn't already bet on. */
export async function runBot(bot: Bot): Promise<BotRunResult> {
  const result: BotRunResult = { botId: bot.id, placed: 0, skipped: 0, errors: [] }
  if (!bot.enabled) {
    result.errors.push('bot is disabled')
    return result
  }

  const upcoming = (await db.matches.all()).filter((m) => m.status === 'upcoming')
  const existing = await db.bets.find((b) => b.userId === bot.userId)
  const alreadyBet = new Set(existing.map((b) => b.matchId))

  for (const match of upcoming) {
    if (alreadyBet.has(match.id)) {
      result.skipped++
      continue
    }
    try {
      const probability = await fetchPrediction(bot, match)
      const side = decideBet(probability, bot.threshold)
      if (!side) {
        result.skipped++
        continue
      }
      await db.bets.set({
        id: newId(),
        matchId: match.id,
        userId: bot.userId,
        side,
        confidence: side === 'home' ? probability : 1 - probability,
        createdAt: new Date().toISOString(),
      })
      result.placed++
    } catch (error) {
      result.errors.push(`${match.id}: ${(error as Error).message}`)
    }
  }
  return result
}

/** Runs every enabled bot — invoked by the scheduled Nitro task. */
export async function runAllBots(): Promise<BotRunResult[]> {
  const bots = (await db.bots.all()).filter((b) => b.enabled)
  return Promise.all(bots.map(runBot))
}
