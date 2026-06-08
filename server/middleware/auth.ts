// Populates event.context.user on every request so route handlers and the
// requireUser/requireAdmin guards can read it without re-parsing the cookie.

export default defineEventHandler(async (event) => {
  event.context.user = await getSessionUser(event)
})
