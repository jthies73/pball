// Optional scheduled task: run every enabled bot. Trigger manually with
//   `nuxt dev` + devtools, or wire a cron via nitro.scheduledTasks in
//   nuxt.config.ts, e.g.  scheduledTasks: { '0 * * * *': ['bots:run-all'] }
//   (requires experimental.tasks). Kept separate from the on-demand route.
export default defineTask({
  meta: {
    name: 'bots:run-all',
    description: 'Run the AI betting engine for every enabled bot',
  },
  async run() {
    const bots = (await listBots()).filter((b) => b.enabled)
    const summaries = []
    for (const bot of bots) summaries.push(await runBot(bot))
    return { result: { ran: summaries.length, summaries } }
  },
})
