// Route guard: admins only. Usage: definePageMeta({ middleware: 'admin' })
export default defineNuxtRouteMiddleware(() => {
  const { isAdmin } = useAuth()
  if (!isAdmin.value) return navigateTo('/')
})
