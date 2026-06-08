<script setup lang="ts">
import type { Match } from '#shared/types'

const props = defineProps<{ match: Match }>()
const { isLoggedIn } = useAuth()
const placeBet = usePlaceBet()

const stake = ref(50)
const busy = ref(false)
const message = ref('')

async function back(side: 'home' | 'away') {
  busy.value = true
  message.value = ''
  try {
    await placeBet(props.match.id, side, stake.value)
    message.value = `Bet placed on ${side === 'home' ? props.match.homeTeam : props.match.awayTeam}!`
  } catch (e: any) {
    message.value = e?.data?.statusMessage ?? 'Could not place bet'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="rounded-lg border bg-white p-4 shadow-sm">
    <div class="mb-3 flex items-center justify-between text-sm text-gray-500">
      <span>{{ new Date(match.tipoff).toLocaleString() }}</span>
      <span class="uppercase">{{ match.status }}</span>
    </div>
    <div class="mb-4 flex items-center justify-center gap-3 text-lg font-semibold">
      <span>{{ match.awayTeam }}</span>
      <span class="text-gray-400">@</span>
      <span>{{ match.homeTeam }}</span>
    </div>

    <div v-if="isLoggedIn" class="space-y-2">
      <div class="flex items-center gap-2">
        <input
          v-model.number="stake"
          type="number"
          min="1"
          class="w-24 rounded border px-2 py-1 text-sm"
        />
        <button
          class="flex-1 rounded bg-blue-600 px-3 py-1 text-sm text-white disabled:opacity-50"
          :disabled="busy"
          @click="back('away')"
        >
          Back {{ match.awayTeam }}
        </button>
        <button
          class="flex-1 rounded bg-green-600 px-3 py-1 text-sm text-white disabled:opacity-50"
          :disabled="busy"
          @click="back('home')"
        >
          Back {{ match.homeTeam }}
        </button>
      </div>
      <p v-if="message" class="text-xs text-gray-600">{{ message }}</p>
    </div>
    <p v-else class="text-center text-sm text-gray-400">
      <NuxtLink to="/login" class="underline">Log in</NuxtLink> to bet
    </p>
  </div>
</template>
