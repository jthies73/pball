import type { Bet, LeaderboardEntry, User } from '~~/shared/types'

/**
 * Confidence-weighted scoring. A plain correct pick is worth 1 point; bots that
 * stake a confident probability earn (or lose) a bonus proportional to how far
 * from a coin-flip they committed. Unresolved bets are ignored.
 */
function scoreBets(bets: Bet[]): { total: number; correct: number; points: number } {
  let total = 0
  let correct = 0
  let points = 0
  for (const bet of bets) {
    if (bet.isCorrect === undefined) continue // match not final yet
    total++
    const edge = bet.confidence !== undefined ? Math.abs(bet.confidence - 0.5) : 0
    if (bet.isCorrect) {
      correct++
      points += 1 + edge
    } else {
      points -= edge
    }
  }
  return { total, correct, points }
}

/** Builds the ranked global leaderboard from every participant's resolved bets. */
export function buildLeaderboard(users: User[], bets: Bet[]): LeaderboardEntry[] {
  const betsByUser = new Map<string, Bet[]>()
  for (const bet of bets) {
    const list = betsByUser.get(bet.userId) ?? []
    list.push(bet)
    betsByUser.set(bet.userId, list)
  }

  const entries: LeaderboardEntry[] = users.map((user) => {
    const { total, correct, points } = scoreBets(betsByUser.get(user.id) ?? [])
    return {
      rank: 0,
      userId: user.id,
      username: user.username,
      isBot: user.isBot,
      totalBets: total,
      correctBets: correct,
      accuracy: total ? correct / total : 0,
      points: Math.round(points * 100) / 100,
    }
  })

  entries.sort(
    (a, b) =>
      b.points - a.points ||
      b.accuracy - a.accuracy ||
      b.totalBets - a.totalBets ||
      a.username.localeCompare(b.username),
  )
  entries.forEach((entry, index) => (entry.rank = index + 1))
  return entries
}
