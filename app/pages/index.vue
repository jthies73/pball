<script setup lang="ts">
const { upcoming, past, fetchMatches, fetchMyBets } = useMatches()
const { entries, fetchScoreboard } = useScoreboard()
const { isLoggedIn, user } = useAuth()

// One SSR-friendly initial load for the whole page.
await useAsyncData('home', async () => {
  await Promise.all([
    fetchMatches(),
    fetchScoreboard(),
    isLoggedIn.value ? fetchMyBets() : Promise.resolve(),
  ])
  return true
})
</script>

<template>
  <div class="grid gap-8 lg:grid-cols-[1fr_20rem]">
    <div class="space-y-8">
      <section>
        <h2 class="mb-3 text-lg font-bold text-slate-900">Upcoming</h2>
        <div v-if="upcoming.length" class="grid gap-4 sm:grid-cols-2">
          <MatchCard v-for="match in upcoming" :key="match.id" :match="match" />
        </div>
        <p
          v-else
          class="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400"
        >
          No upcoming matches on the schedule.
        </p>
      </section>

      <section>
        <h2 class="mb-3 text-lg font-bold text-slate-900">Recent results</h2>
        <div v-if="past.length" class="grid gap-4 sm:grid-cols-2">
          <MatchCard v-for="match in past" :key="match.id" :match="match" />
        </div>
        <p
          v-else
          class="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400"
        >
          No completed matches yet.
        </p>
      </section>
    </div>

    <aside class="space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold text-slate-900">Leaderboard</h2>
        <NuxtLink to="/leaderboard" class="text-sm font-medium text-emerald-600 hover:underline">
          View all
        </NuxtLink>
      </div>
      <Scoreboard :entries="entries" :limit="5" :highlight-user-id="user?.id" />
    </aside>
  </div>
</template>
