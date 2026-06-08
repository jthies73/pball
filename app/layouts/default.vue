<script setup lang="ts">
const { user, isLoggedIn, isAdmin, logout } = useAuth()
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-900">
    <header class="border-b bg-white">
      <nav class="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3">
        <NuxtLink to="/" class="text-lg font-bold">🏀 PBall</NuxtLink>
        <NuxtLink to="/matches" class="text-sm hover:underline">Matches</NuxtLink>
        <NuxtLink v-if="isAdmin" to="/admin" class="text-sm hover:underline">Admin</NuxtLink>
        <span class="flex-1" />
        <template v-if="isLoggedIn">
          <span class="text-sm text-gray-500">
            {{ user?.displayName }} · {{ user?.balance }} cr
          </span>
          <button class="text-sm text-red-600 hover:underline" @click="logout">Logout</button>
        </template>
        <template v-else>
          <NuxtLink to="/login" class="text-sm hover:underline">Login</NuxtLink>
          <NuxtLink to="/register" class="text-sm font-medium hover:underline">Register</NuxtLink>
        </template>
      </nav>
    </header>
    <main class="mx-auto max-w-5xl px-4 py-8">
      <slot />
    </main>
  </div>
</template>
