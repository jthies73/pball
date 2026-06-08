<script setup lang="ts">
const { gamedays, pending } = useMatches()
</script>

<template>
  <section>
    <h1 class="mb-6 text-2xl font-bold">Upcoming Gamedays</h1>
    <p v-if="pending" class="text-gray-500">Loading…</p>

    <div v-for="day in gamedays" :key="day.date" class="mb-8">
      <h2 class="mb-3 text-lg font-semibold text-gray-700">
        {{ new Date(day.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) }}
      </h2>
      <div class="grid gap-4 sm:grid-cols-2">
        <MatchCard v-for="m in day.matches" :key="m.id" :match="m" />
      </div>
    </div>

    <p v-if="!pending && gamedays.length === 0" class="text-gray-500">
      No upcoming matches.
    </p>
  </section>
</template>
