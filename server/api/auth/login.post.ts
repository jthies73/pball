export default defineEventHandler(async (event) => {
  const { email, password } = await readBody<{ email?: string; password?: string }>(event)
  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Email and password are required' })
  }

  const user = await getUserByEmail(email.trim().toLowerCase())
  // Same error for unknown user / bad password to avoid account enumeration.
  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }

  setUserSession(event, user.id)
  return toPublicUser(user)
})
