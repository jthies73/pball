// PATCH /api/admin/bots/:id — toggle enabled or tweak strategy.
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')!
  const bot = await getBotById(id)
  if (!bot) throw createError({ statusCode: 404, statusMessage: 'Bot not found' })

  const body = await readBody<{
    enabled?: boolean
    minConfidence?: number
    stakePerBet?: number
  }>(event)

  if (typeof body.enabled === 'boolean') bot.enabled = body.enabled
  if (typeof body.minConfidence === 'number') {
    bot.strategy.minConfidence = Math.min(Math.max(body.minConfidence, 0.5), 0.99)
  }
  if (typeof body.stakePerBet === 'number') {
    bot.strategy.stakePerBet = Math.max(1, body.stakePerBet)
  }

  await saveBot(bot)
  return bot
})
