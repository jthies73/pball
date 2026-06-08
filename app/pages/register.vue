<script setup lang="ts">
const { register } = useAuth()
const email = ref('')
const password = ref('')
const displayName = ref('')
const error = ref('')

async function submit() {
  error.value = ''
  try {
    await register(email.value, password.value, displayName.value)
    await navigateTo('/matches')
  } catch (e: any) {
    error.value = e?.data?.statusMessage ?? 'Registration failed'
  }
}
</script>

<template>
  <section class="mx-auto max-w-sm">
    <h1 class="mb-6 text-2xl font-bold">Create account</h1>
    <form class="space-y-4" @submit.prevent="submit">
      <input v-model="displayName" placeholder="Display name" class="w-full rounded border px-3 py-2" />
      <input v-model="email" type="email" placeholder="Email" required class="w-full rounded border px-3 py-2" />
      <input v-model="password" type="password" placeholder="Password (min 8 chars)" required class="w-full rounded border px-3 py-2" />
      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      <button class="w-full rounded bg-green-600 px-4 py-2 text-white">Register</button>
    </form>
  </section>
</template>
