import type { LeaderboardEntry } from '~~/shared/types'

/** Global scoreboard — humans and bots ranked together by resolved-bet performance. */
export default defineEventHandler(async (): Promise<LeaderboardEntry[]> => {
  const [users, bets] = await Promise.all([db.users.all(), db.bets.all()])
  return buildLeaderboard(users, bets)
})
