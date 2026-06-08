/** Route guard: requires a logged-in user. Apply via `definePageMeta`. */
export default defineNuxtRouteMiddleware(() => {
  const { isLoggedIn } = useAuth()
  if (!isLoggedIn.value) {
    return navigateTo('/login')
  }
})
