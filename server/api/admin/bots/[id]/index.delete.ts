export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const id = getRouterParam(event, 'id')
  const bot = id ? await db.bots.get(id) : null
  if (!bot) throw createError({ statusCode: 404, statusMessage: 'Bot not found' })

  await db.bots.remove(bot.id)
  await db.users.remove(bot.userId)
  // Historical bets are intentionally kept so past-match breakdowns stay intact.
  return { ok: true }
})
