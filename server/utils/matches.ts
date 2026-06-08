import type { Match, MatchSide } from '~~/shared/types'

/**
 * Finalizes a match and resolves every bet on it in one step: sets the winner /
 * score, flips the match to "final", and stamps `isCorrect` on each bet so the
 * leaderboard reflects the result immediately.
 */
export async function finalizeMatch(
  matchId: string,
  winner: MatchSide,
  homeScore?: number,
  awayScore?: number,
): Promise<Match> {
  const match = await db.matches.get(matchId)
  if (!match) throw createError({ statusCode: 404, statusMessage: 'Match not found' })

  match.status = 'final'
  match.winner = winner
  if (homeScore !== undefined) match.homeScore = homeScore
  if (awayScore !== undefined) match.awayScore = awayScore
  await db.matches.set(match)

  const bets = await db.bets.find((b) => b.matchId === matchId)
  await Promise.all(bets.map((b) => db.bets.set({ ...b, isCorrect: b.side === winner })))

  return match
}
