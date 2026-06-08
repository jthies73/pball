/**
 * Scheduled Nitro task that drives every enabled bot to place its bets.
 *
 * Wired to a cron schedule in `nuxt.config.ts` (`nitro.scheduledTasks`) and also
 * runnable on demand:  `npx nuxi task run bots:run`
 * Requires `nitro.experimental.tasks = true`.
 */
export default defineTask({
  meta: {
    name: 'bots:run',
    description: 'Run all enabled AI bots against open matches',
  },
  async run() {
    const results = await runAllBots()
    const placed = results.reduce((total, r) => total + r.placed, 0)
    return { result: { bots: results.length, placed, details: results } }
  },
})
