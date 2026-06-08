// DELETE /api/admin/bots/:id — deprovision a bot (keeps its user/bet history).
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')!
  const bot = await getBotById(id)
  if (!bot) throw createError({ statusCode: 404, statusMessage: 'Bot not found' })
  await deleteBot(id)
  return { ok: true }
})
