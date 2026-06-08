import type { AuthResponse } from '~~/shared/types'

export default defineEventHandler((event): AuthResponse => {
  clearAuthCookie(event)
  return { user: null }
})
