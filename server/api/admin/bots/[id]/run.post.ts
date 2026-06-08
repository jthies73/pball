import type { BotRunResult } from '~~/shared/types'

/** Triggers a single bot to evaluate and bet on all open matches, on demand. */
export default defineEventHandler(async (event): Promise<BotRunResult> => {
  requireAdmin(event)
  const id = getRouterParam(event, 'id')
  const bot = id ? await db.bots.get(id) : null
  if (!bot) throw createError({ statusCode: 404, statusMessage: 'Bot not found' })

  return runBot(bot)
})
