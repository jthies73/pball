// GET /api/bets — the authenticated user's own bet history.
export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const bets = await listBetsByUser(user.id)
  bets.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return bets
})
