import type { UserRecord } from '#shared/types'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email?: string; password?: string; displayName?: string }>(event)
  const email = body.email?.trim().toLowerCase()
  const password = body.password
  const displayName = body.displayName?.trim() || email?.split('@')[0]

  if (!email || !password || password.length < 8) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email and a password of at least 8 characters are required',
    })
  }
  if (await getUserByEmail(email)) {
    throw createError({ statusCode: 409, statusMessage: 'Email already registered' })
  }

  const user: UserRecord = {
    id: newId(),
    email,
    displayName: displayName!,
    role: 'user',
    balance: 1000, // starting virtual currency
    isBot: false,
    createdAt: new Date().toISOString(),
    passwordHash: hashPassword(password),
  }
  await saveUser(user)

  setUserSession(event, user.id)
  return toPublicUser(user)
})
