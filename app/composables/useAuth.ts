import type { PublicUser } from '#shared/types'

// Session state lives in Nuxt's native `useState` — SSR-friendly, shared across
// components, no Pinia/Vuex. The httpOnly cookie is the source of truth on the
// server; this is just the hydrated client mirror.
export function useAuth() {
  const user = useState<PublicUser | null>('auth:user', () => null)

  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  /** Hydrate from the session cookie (call once, e.g. in a plugin/app setup). */
  async function fetchUser() {
    user.value = await $fetch<PublicUser | null>('/api/auth/me')
    return user.value
  }

  async function login(email: string, password: string) {
    user.value = await $fetch<PublicUser>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    })
  }

  async function register(email: string, password: string, displayName?: string) {
    user.value = await $fetch<PublicUser>('/api/auth/register', {
      method: 'POST',
      body: { email, password, displayName },
    })
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    await navigateTo('/login')
  }

  return { user, isLoggedIn, isAdmin, fetchUser, login, register, logout }
}
