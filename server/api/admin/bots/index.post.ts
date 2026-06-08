import type { Bot, UserRecord } from '#shared/types'

// POST /api/admin/bots — provision a new AI bot account (admin only).
// Each bot owns a dedicated (isBot) user so its bets debit a real balance.
export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const body = await readBody<{
    name?: string
    startingBalance?: number
    minConfidence?: number
    stakePerBet?: number
  }>(event)

  const name = body.name?.trim()
  if (!name) throw createError({ statusCode: 400, statusMessage: 'Bot name is required' })

  const botUser: UserRecord = {
    id: newId(),
    email: `bot+${newId()}@bots.local`,
    displayName: name,
    role: 'user',
    balance: body.startingBalance ?? 10_000,
    isBot: true,
    createdAt: new Date().toISOString(),
    // Bots never log in; store an unusable hash.
    passwordHash: 'x:x',
  }
  await saveUser(botUser)

  const bot: Bot = {
    id: newId(),
    userId: botUser.id,
    name,
    ownerId: admin.id,
    enabled: true,
    strategy: {
      minConfidence: clamp(body.minConfidence ?? 0.6, 0.5, 0.99),
      stakePerBet: Math.max(1, body.stakePerBet ?? 50),
    },
    createdAt: new Date().toISOString(),
  }
  await saveBot(bot)
  return bot
})

function clamp(n: number, lo: number, hi: number) {
  return Math.min(Math.max(n, lo), hi)
}
