import type { Bot, UpdateBotPayload } from '~~/shared/types'

export default defineEventHandler(async (event): Promise<Bot> => {
  requireAdmin(event)
  const id = getRouterParam(event, 'id')
  const bot = id ? await db.bots.get(id) : null
  if (!bot) throw createError({ statusCode: 404, statusMessage: 'Bot not found' })

  const body = await readBody<UpdateBotPayload>(event)

  if (body.name !== undefined) {
    bot.name = body.name.trim()
    // Keep the backing participant's display name in sync for the leaderboard.
    const user = await db.users.get(bot.userId)
    if (user) {
      user.username = bot.name
      await db.users.set(user)
    }
  }
  if (body.apiUrl !== undefined) bot.apiUrl = body.apiUrl.trim()
  if (body.apiKey !== undefined) bot.apiKey = body.apiKey.trim() || undefined
  if (body.threshold !== undefined) bot.threshold = Math.min(0.5, Math.max(0, body.threshold))
  if (body.enabled !== undefined) bot.enabled = body.enabled

  return db.bots.set(bot)
})
