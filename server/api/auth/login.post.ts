import type { AuthResponse, LoginPayload } from '~~/shared/types'

export default defineEventHandler(async (event): Promise<AuthResponse> => {
  const body = await readBody<LoginPayload>(event)
  const email = body?.email?.trim().toLowerCase()
  const password = body?.password ?? ''

  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'email and password are required' })
  }

  const user = await db.users.findOne((u) => u.email === email)
  const ok = user ? await verifyPassword(password, user.passwordHash) : false
  if (!user || !ok) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid email or password' })
  }

  setAuthCookie(event, signToken(user.id, user.role, getAuthSecret(event)))
  return { user: toPublicUser(user) }
})
