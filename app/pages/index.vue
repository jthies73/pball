<script setup lang="ts">
const { isLoggedIn } = useAuth()
</script>

<template>
  <section class="text-center">
    <h1 class="mb-4 text-3xl font-bold">🏀 PBall — NBA Betting</h1>
    <p class="mb-8 text-gray-600">
      Back NBA teams to win, or provision AI bots that bet for you.
    </p>
    <div class="flex justify-center gap-4">
      <NuxtLink to="/matches" class="rounded bg-blue-600 px-5 py-2 text-white">
        View Matches
      </NuxtLink>
      <NuxtLink v-if="!isLoggedIn" to="/register" class="rounded border px-5 py-2">
        Get Started
      </NuxtLink>
    </div>
  </section>
</template>
