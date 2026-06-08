<script setup lang="ts">
import type { Bot } from '#shared/types'

definePageMeta({ middleware: ['auth', 'admin'] })

const { data: bots, refresh } = await useAsyncData('admin:bots', () =>
  $fetch<Bot[]>('/api/admin/bots'),
)

const form = reactive({ name: '', startingBalance: 10000, minConfidence: 0.6, stakePerBet: 50 })
const runResult = ref<Record<string, string>>({})

async function createBot() {
  await $fetch('/api/admin/bots', { method: 'POST', body: { ...form } })
  form.name = ''
  await refresh()
}

async function toggle(bot: Bot) {
  await $fetch(`/api/admin/bots/${bot.id}`, { method: 'PATCH', body: { enabled: !bot.enabled } })
  await refresh()
}

async function run(bot: Bot) {
  runResult.value[bot.id] = 'Running…'
  const res = await $fetch<{ placed: number; skipped: number; remainingBalance: number }>(
    `/api/admin/bots/${bot.id}/run`,
    { method: 'POST' },
  )
  runResult.value[bot.id] = `Placed ${res.placed}, skipped ${res.skipped}, balance ${res.remainingBalance}`
  await refresh()
}

async function remove(bot: Bot) {
  await $fetch(`/api/admin/bots/${bot.id}`, { method: 'DELETE' })
  await refresh()
}
</script>

<template>
  <section>
    <h1 class="mb-6 text-2xl font-bold">Admin · AI Bots</h1>

    <form class="mb-8 grid grid-cols-2 gap-3 rounded-lg border bg-white p-4 sm:grid-cols-5" @submit.prevent="createBot">
      <input v-model="form.name" placeholder="Bot name" required class="rounded border px-2 py-1 text-sm" />
      <input v-model.number="form.startingBalance" type="number" placeholder="Balance" class="rounded border px-2 py-1 text-sm" />
      <input v-model.number="form.minConfidence" type="number" step="0.01" placeholder="Min conf." class="rounded border px-2 py-1 text-sm" />
      <input v-model.number="form.stakePerBet" type="number" placeholder="Stake" class="rounded border px-2 py-1 text-sm" />
      <button class="rounded bg-green-600 px-3 py-1 text-sm text-white">Provision</button>
    </form>

    <div class="space-y-3">
      <div v-for="bot in bots" :key="bot.id" class="rounded-lg border bg-white p-4">
        <div class="flex items-center justify-between">
          <div>
            <span class="font-semibold">{{ bot.name }}</span>
            <span class="ml-2 text-xs text-gray-500">
              conf ≥ {{ bot.strategy.minConfidence }} · stake {{ bot.strategy.stakePerBet }}
            </span>
            <span class="ml-2 text-xs" :class="bot.enabled ? 'text-green-600' : 'text-gray-400'">
              {{ bot.enabled ? 'enabled' : 'disabled' }}
            </span>
          </div>
          <div class="flex gap-2 text-sm">
            <button class="rounded bg-blue-600 px-3 py-1 text-white" @click="run(bot)">Run</button>
            <button class="rounded border px-3 py-1" @click="toggle(bot)">
              {{ bot.enabled ? 'Disable' : 'Enable' }}
            </button>
            <button class="rounded border px-3 py-1 text-red-600" @click="remove(bot)">Delete</button>
          </div>
        </div>
        <p v-if="runResult[bot.id]" class="mt-2 text-xs text-gray-600">{{ runResult[bot.id] }}</p>
      </div>
      <p v-if="!bots?.length" class="text-gray-500">No bots provisioned yet.</p>
    </div>
  </section>
</template>
