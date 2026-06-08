import type { Bot } from '~~/shared/types'

export default defineEventHandler(async (event): Promise<Bot[]> => {
  requireAdmin(event)
  return (await db.bots.all()).sort((a, b) => a.name.localeCompare(b.name))
})
