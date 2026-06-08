/**
 * One ranked row on the global scoreboard. Computed on demand from resolved
 * bets — humans and bots share the same shape and the same ranking.
 */
export interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  isBot: boolean
  totalBets: number
  correctBets: number
  /** correctBets / totalBets, 0..1. */
  accuracy: number
  /** Ranking score (confidence-weighted — see `server/utils/scoring.ts`). */
  points: number
}
