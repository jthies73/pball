import type { AuthResponse } from '~~/shared/types'

export default defineEventHandler((event): AuthResponse => {
  return { user: getSessionUser(event) }
})
