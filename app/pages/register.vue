<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { register } = useAuth()
const username = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500'

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await register({ username: username.value, email: email.value, password: password.value })
    await navigateTo('/')
  } catch (err) {
    error.value = apiErrorMessage(err, 'Registration failed')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form
    class="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    @submit.prevent="submit"
  >
    <h1 class="text-xl font-bold text-slate-900">Create your account</h1>

    <label class="block space-y-1">
      <span class="text-sm font-medium text-slate-700">Username</span>
      <input v-model="username" type="text" required autocomplete="username" :class="inputClass" />
    </label>

    <label class="block space-y-1">
      <span class="text-sm font-medium text-slate-700">Email</span>
      <input v-model="email" type="email" required autocomplete="email" :class="inputClass" />
    </label>

    <label class="block space-y-1">
      <span class="text-sm font-medium text-slate-700">Password</span>
      <input
        v-model="password"
        type="password"
        required
        minlength="8"
        autocomplete="new-password"
        :class="inputClass"
      />
      <span class="text-xs text-slate-400">At least 8 characters.</span>
    </label>

    <p v-if="error" class="text-sm text-rose-600">{{ error }}</p>

    <button
      type="submit"
      :disabled="loading"
      class="w-full rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
    >
      {{ loading ? 'Creating…' : 'Create account' }}
    </button>

    <p class="text-center text-sm text-slate-500">
      Already have an account?
      <NuxtLink to="/login" class="font-medium text-emerald-600 hover:underline">Log in</NuxtLink>
    </p>
  </form>
</template>
