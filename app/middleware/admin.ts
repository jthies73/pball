/** Route guard: requires an admin. Non-admins are bounced to the home page. */
export default defineNuxtRouteMiddleware(() => {
  const { isAdmin } = useAuth()
  if (!isAdmin.value) {
    return navigateTo('/')
  }
})
