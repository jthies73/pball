// Hydrate the auth state on the server for the initial render so guards and
// the layout know who's logged in without a client round-trip.
export default defineNuxtPlugin(async () => {
  await useAuth().fetchUser()
})
