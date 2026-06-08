import type { Bet, PlaceBetPayload } from '~~/shared/types'

/**
 * Places (or updates) the current user's bet on an upcoming match. Betting is
 * rejected once a match is final. A user has at most one bet per match; posting
 * again while the match is still upcoming changes the pick.
 */
export default defineEventHandler(async (event): Promise<Bet> => {
  const user = requireUser(event)
  const body = await readBody<PlaceBetPayload>(event)
  const { matchId, side } = body ?? {}

  if (!matchId || (side !== 'home' && side !== 'away')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'matchId and side ("home" | "away") are required',
    })
  }

  const match = await db.matches.get(matchId)
  if (!match) throw createError({ statusCode: 404, statusMessage: 'Match not found' })
  if (match.status !== 'upcoming') {
    throw createError({ statusCode: 409, statusMessage: 'Betting is closed for this match' })
  }

  const existing = await db.bets.findOne((b) => b.matchId === matchId && b.userId === user.id)
  if (existing) {
    existing.side = side
    return db.bets.set(existing)
  }

  return db.bets.set({
    id: newId(),
    matchId,
    userId: user.id,
    side,
    createdAt: new Date().toISOString(),
  })
})
