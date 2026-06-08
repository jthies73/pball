import type { AuthResponse, LoginPayload, RegisterPayload, SessionUser } from '~~/shared/types'

/**
 * Session state + auth actions. Backed by `useState` so the user is shared
 * across components and survives SSR → client hydration. Hydrated once on boot
 * by `app/plugins/session.ts`.
 */
export function useAuth() {
  const user = useState<SessionUser | null>('auth:user', () => null)
  const isLoggedIn = computed(() => user.value !== null)
  const isAdmin = computed(() => user.value?.role === 'admin')

  async function refresh(): Promise<SessionUser | null> {
    const { user: me } = await $fetch<AuthResponse>('/api/auth/me')
    user.value = me
    return me
  }

  async function login(payload: LoginPayload): Promise<SessionUser | null> {
    const { user: me } = await $fetch<AuthResponse>('/api/auth/login', { method: 'POST', body: payload })
    user.value = me
    return me
  }

  async function register(payload: RegisterPayload): Promise<SessionUser | null> {
    const { user: me } = await $fetch<AuthResponse>('/api/auth/register', { method: 'POST', body: payload })
    user.value = me
    return me
  }

  async function logout(): Promise<void> {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
  }

  return { user, isLoggedIn, isAdmin, refresh, login, register, logout }
}
