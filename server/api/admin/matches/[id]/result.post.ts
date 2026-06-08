import type { FinalizeMatchPayload, Match } from '~~/shared/types'

/** Finalizes a match and resolves all of its bets in one call (admin). */
export default defineEventHandler(async (event): Promise<Match> => {
  requireAdmin(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'match id is required' })

  const body = await readBody<FinalizeMatchPayload>(event)
  if (body?.winner !== 'home' && body?.winner !== 'away') {
    throw createError({ statusCode: 400, statusMessage: 'winner ("home" | "away") is required' })
  }

  return finalizeMatch(id, body.winner, body.homeScore, body.awayScore)
})
