// Returns the current user (or null). The middleware already resolved it.
export default defineEventHandler((event) => {
  return event.context.user ?? null
})
