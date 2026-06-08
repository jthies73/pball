// The bot engine, extracted so it can be driven by either the admin route
// (POST /api/admin/bots/:id/run) or a scheduled Nitro task (server/tasks/).

import type { Bet, Bot } from '#shared/types'

export interface RunResult {
  matchId: string
  homeProbability: number
  confidence: number
  decision: 'bet' | 'skip'
  bet?: Bet
  reason?: string
}

export interface RunSummary {
  botId: string
  ranAt: string
  placed: number
  skipped: number
  remainingBalance: number
  results: RunResult[]
}

/**
 * Run one bot over all open matches:
 *   1. fetch home win probability from the external AI service
 *   2. apply the bot's strategy
 *   3. place a simulated bet against the bot's own balance
 */
export async function runBot(bot: Bot): Promise<RunSummary> {
  const botUser = await getUserById(bot.userId)
  if (!botUser) throw createError({ statusCode: 500, statusMessage: 'Bot account missing' })

  const openMatches = (await listMatches()).filter((m) => m.status === 'scheduled')
  const alreadyBet = new Set((await listBetsByUser(bot.userId)).map((b) => b.matchId))

  const results: RunResult[] = []

  for (const match of openMatches) {
    if (alreadyBet.has(match.id)) continue // one bet per match per bot

    const homeProbability = await fetchWinProbability(match) // 1. external AI
    const decision = decideBet(bot, homeProbability) // 2. strategy

    if (!decision.shouldBet) {
      results.push({
        matchId: match.id,
        homeProbability,
        confidence: decision.confidence,
        decision: 'skip',
        reason: 'below minConfidence',
      })
      continue
    }

    try {
      const bet = await placeBet({ // 3. place simulated bet
        user: botUser,
        match,
        side: decision.side!,
        stake: decision.stake!,
        odds: probabilityToOdds(
          decision.side === 'home' ? homeProbability : 1 - homeProbability,
        ),
        automated: true,
      })
      results.push({ matchId: match.id, homeProbability, confidence: decision.confidence, decision: 'bet', bet })
    } catch (err: any) {
      results.push({
        matchId: match.id,
        homeProbability,
        confidence: decision.confidence,
        decision: 'skip',
        reason: err?.statusMessage ?? 'placement failed',
      })
    }
  }

  bot.lastRunAt = new Date().toISOString()
  await saveBot(bot)

  return {
    botId: bot.id,
    ranAt: bot.lastRunAt,
    placed: results.filter((r) => r.decision === 'bet').length,
    skipped: results.filter((r) => r.decision === 'skip').length,
    remainingBalance: botUser.balance,
    results,
  }
}
