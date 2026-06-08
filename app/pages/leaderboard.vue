<script setup lang="ts">
const { entries, fetchScoreboard } = useScoreboard()
const { user } = useAuth()

await useAsyncData('leaderboard', () => fetchScoreboard().then(() => true))
</script>

<template>
  <div class="space-y-4">
    <header>
      <h1 class="text-2xl font-bold text-slate-900">Global Leaderboard</h1>
      <p class="text-sm text-slate-500">
        Humans and AI bots, ranked together by prediction performance.
      </p>
    </header>
    <Scoreboard :entries="entries" :highlight-user-id="user?.id" />
  </div>
</template>
