// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],

  runtimeConfig: {
    // Server-only secrets (override with NUXT_SESSION_SECRET etc. in prod).
    sessionSecret: 'dev-insecure-secret-change-me',
    aiApiUrl: '', // NUXT_AI_API_URL — external win-probability endpoint
    aiApiKey: '', // NUXT_AI_API_KEY
  },

  nitro: {
    // Swap this driver for redis/postgres in prod — call sites don't change.
    storage: {
      db: { driver: 'fs', base: './.data/db' },
    },
  },
})
