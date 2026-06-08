import type { Bot, CreateBotPayload } from '~~/shared/types'

/**
 * Provisions a new AI bot. Every bot gets a backing participant {@link User}
 * (so its bets and leaderboard standing flow through the same code paths as a
 * human's). Bots never log in, so the account is given a random, unusable hash.
 */
export default defineEventHandler(async (event): Promise<Bot> => {
  requireAdmin(event)
  const body = await readBody<CreateBotPayload>(event)
  const name = body?.name?.trim()
  const apiUrl = body?.apiUrl?.trim()

  if (!name || !apiUrl) {
    throw createError({ statusCode: 400, statusMessage: 'name and apiUrl are required' })
  }

  const now = new Date().toISOString()
  const userId = newId()
  const botId = newId()

  await db.users.set({
    id: userId,
    username: name,
    email: `${botId}@bots.pball.local`,
    role: 'user',
    isBot: true,
    botId,
    createdAt: now,
    passwordHash: await hashPassword(newId()),
  })

  return db.bots.set({
    id: botId,
    userId,
    name,
    apiUrl,
    apiKey: body.apiKey?.trim() || undefined,
    threshold: Math.min(0.5, Math.max(0, body.threshold ?? 0)),
    enabled: body.enabled ?? true,
    createdAt: now,
  })
})
