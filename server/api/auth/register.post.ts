import type { AuthResponse, RegisterPayload } from '~~/shared/types'

export default defineEventHandler(async (event): Promise<AuthResponse> => {
  const body = await readBody<RegisterPayload>(event)
  const email = body?.email?.trim().toLowerCase()
  const username = body?.username?.trim()
  const password = body?.password ?? ''

  if (!email || !username || password.length < 8) {
    throw createError({
      statusCode: 400,
      statusMessage: 'username, email, and a password of at least 8 characters are required',
    })
  }

  if (await db.users.findOne((u) => u.email === email)) {
    throw createError({ statusCode: 409, statusMessage: 'That email is already registered' })
  }

  const user: StoredUser = {
    id: newId(),
    username,
    email,
    role: 'user',
    isBot: false,
    createdAt: new Date().toISOString(),
    passwordHash: await hashPassword(password),
  }
  await db.users.set(user)

  setAuthCookie(event, signToken(user.id, user.role, getAuthSecret(event)))
  return { user: toPublicUser(user) }
})
