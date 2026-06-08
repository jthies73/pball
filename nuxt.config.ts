// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],

  // Server-only secret used to sign session tokens. Override in production with
  // the NUXT_AUTH_SECRET env var (see .env.example).
  runtimeConfig: {
    authSecret: 'dev-insecure-secret-change-me',
  },

  nitro: {
    // Enables Nitro's task runner (the bot engine runs as a task).
    experimental: { tasks: true },
    // Drive every enabled bot to bet on open matches, on a schedule.
    scheduledTasks: {
      '*/15 * * * *': ['bots:run'],
    },
    // The `db` storage mount used by server/utils/db.ts. Swap this driver for
    // redis / cloudflare-kv / postgres etc. without touching application code.
    storage: {
      db: { driver: 'fs', base: './.data/db' },
    },
    devStorage: {
      db: { driver: 'fs', base: './.data/db' },
    },
  },
})
