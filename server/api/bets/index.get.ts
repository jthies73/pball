import type { Bet } from '~~/shared/types'

/** Returns every bet placed by the current user (used to highlight their picks). */
export default defineEventHandler(async (event): Promise<Bet[]> => {
  const user = requireUser(event)
  return db.bets.find((b) => b.userId === user.id)
})
