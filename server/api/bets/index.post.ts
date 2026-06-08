import type { BetSide } from '#shared/types'

// POST /api/bets — a human user backs a team to win.
export default defineEventHandler(async (event) => {
  const sessionUser = await requireUser(event)
  const { matchId, side, stake } = await readBody<{
    matchId?: string
    side?: BetSide
    stake?: number
  }>(event)

  if (!matchId || (side !== 'home' && side !== 'away') || typeof stake !== 'number') {
    throw createError({ statusCode: 400, statusMessage: 'matchId, side and stake are required' })
  }

  // Re-load the full record so we can mutate the balance authoritatively.
  const user = await getUserById(sessionUser.id)
  const match = await getMatchById(matchId)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  if (!match) throw createError({ statusCode: 404, statusMessage: 'Match not found' })

  const bet = await placeBet({ user, match, side, stake })
  return { bet, balance: user.balance }
})
