import type { BetBreakdownEntry, MatchDetailResponse } from '~~/shared/types'

/** Returns a match plus the full voting breakdown for its expanded card view. */
export default defineEventHandler(async (event): Promise<MatchDetailResponse> => {
  const id = getRouterParam(event, 'id')
  const match = id ? await db.matches.get(id) : null
  if (!match) throw createError({ statusCode: 404, statusMessage: 'Match not found' })

  const [bets, users] = await Promise.all([
    db.bets.find((b) => b.matchId === match.id),
    db.users.all(),
  ])
  const usersById = new Map(users.map((u) => [u.id, u]))

  const breakdown: BetBreakdownEntry[] = bets
    .map((bet) => {
      const user = usersById.get(bet.userId)
      return {
        betId: bet.id,
        userId: bet.userId,
        username: user?.username ?? 'Unknown',
        isBot: user?.isBot ?? false,
        side: bet.side,
        confidence: bet.confidence,
        isCorrect: bet.isCorrect,
      }
    })
    // Bots first, then alphabetical — gives the breakdown a stable, scannable order.
    .sort((a, b) => Number(b.isBot) - Number(a.isBot) || a.username.localeCompare(b.username))

  return { match, breakdown }
})
