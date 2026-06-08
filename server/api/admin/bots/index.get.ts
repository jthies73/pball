// GET /api/admin/bots — list all provisioned bots (admin only).
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const bots = await listBots()
  bots.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return bots
})
