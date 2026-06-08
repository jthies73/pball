<script setup lang="ts">
const { login } = useAuth()
const email = ref('')
const password = ref('')
const error = ref('')

async function submit() {
  error.value = ''
  try {
    await login(email.value, password.value)
    await navigateTo('/matches')
  } catch (e: any) {
    error.value = e?.data?.statusMessage ?? 'Login failed'
  }
}
</script>

<template>
  <section class="mx-auto max-w-sm">
    <h1 class="mb-6 text-2xl font-bold">Log in</h1>
    <form class="space-y-4" @submit.prevent="submit">
      <input v-model="email" type="email" placeholder="Email" required class="w-full rounded border px-3 py-2" />
      <input v-model="password" type="password" placeholder="Password" required class="w-full rounded border px-3 py-2" />
      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      <button class="w-full rounded bg-blue-600 px-4 py-2 text-white">Log in</button>
    </form>
    <p class="mt-4 text-sm text-gray-500">
      No account? <NuxtLink to="/register" class="underline">Register</NuxtLink>
    </p>
  </section>
</template>
