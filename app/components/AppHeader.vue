<script setup lang="ts">
const { user, isLoggedIn, isAdmin, logout } = useAuth()

async function onLogout() {
  await logout()
  await navigateTo('/login')
}
</script>

<template>
  <header class="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
    <div class="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
      <NuxtLink to="/" class="flex items-center gap-2 text-lg font-extrabold tracking-tight text-slate-900">
        <span class="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500 text-white">🏀</span>
        <span>pball</span>
      </NuxtLink>

      <nav class="flex items-center gap-1 text-sm font-medium">
        <NuxtLink to="/" class="rounded-lg px-3 py-1.5 text-slate-600 hover:bg-slate-100">Matches</NuxtLink>
        <NuxtLink to="/leaderboard" class="rounded-lg px-3 py-1.5 text-slate-600 hover:bg-slate-100">Leaderboard</NuxtLink>
        <NuxtLink v-if="isAdmin" to="/admin" class="rounded-lg px-3 py-1.5 text-slate-600 hover:bg-slate-100">Admin</NuxtLink>
      </nav>

      <div class="flex items-center gap-2 text-sm">
        <template v-if="isLoggedIn">
          <span class="hidden text-slate-500 sm:inline">
            Hi, <span class="font-semibold text-slate-800">{{ user?.username }}</span>
          </span>
          <button
            type="button"
            class="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-50"
            @click="onLogout"
          >
            Log out
          </button>
        </template>
        <template v-else>
          <NuxtLink to="/login" class="rounded-lg px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-100">
            Log in
          </NuxtLink>
          <NuxtLink to="/register" class="rounded-lg bg-emerald-500 px-3 py-1.5 font-semibold text-white hover:bg-emerald-600">
            Sign up
          </NuxtLink>
        </template>
      </div>
    </div>
  </header>
</template>
