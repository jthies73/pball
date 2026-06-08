/**
 * Runs on every request. Resolves the session token cookie into a typed
 * `event.context.user` so route handlers can call `requireUser`/`requireAdmin`
 * without re-parsing auth. Sets `null` (never throws) when unauthenticated.
 */
export default defineEventHandler(async (event) => {
  const token = readAuthToken(event)
  if (!token) {
    event.context.user = null
    return
  }

  const payload = verifyToken(token, getAuthSecret(event))
  const user = payload ? await db.users.get(payload.sub) : null
  event.context.user = user ? toPublicUser(user) : null
})
