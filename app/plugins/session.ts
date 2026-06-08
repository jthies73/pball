import type { AuthResponse } from '~~/shared/types'

/**
 * Hydrates the session once at startup. On the server it uses `useRequestFetch`
 * so the incoming auth cookie is forwarded to `/api/auth/me`; the resolved user
 * is serialized into the payload and reused on the client without a refetch.
 */
export default defineNuxtPlugin(async () => {
  const { user } = useAuth()
  if (user.value) return

  try {
    const request = useRequestFetch()
    const { user: me } = await request<AuthResponse>('/api/auth/me')
    user.value = me
  } catch {
    user.value = null
  }
})
