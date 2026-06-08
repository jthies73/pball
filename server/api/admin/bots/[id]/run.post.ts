// POST /api/admin/bots/:id/run — trigger the bot engine on demand.
// The integration logic lives in server/utils/engine.ts (runBot), shared with
// the optional scheduled task in server/tasks/bots/run-all.ts.
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const botId = getRouterParam(event, 'id')!

  const bot = await getBotById(botId)
  if (!bot) throw createError({ statusCode: 404, statusMessage: 'Bot not found' })
  if (!bot.enabled) throw createError({ statusCode: 409, statusMessage: 'Bot is disabled' })

  return runBot(bot)
})
