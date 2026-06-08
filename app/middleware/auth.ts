// Route guard: redirect anonymous visitors to /login.
// Usage in a page: definePageMeta({ middleware: 'auth' })
export default defineNuxtRouteMiddleware(() => {
  const { isLoggedIn } = useAuth()
  if (!isLoggedIn.value) return navigateTo('/login')
})
