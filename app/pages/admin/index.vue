<script setup lang="ts">
import type { CreateBotPayload, MatchSide } from '~~/shared/types'

definePageMeta({ middleware: 'admin' })

const { bots, fetchBots, createBot, updateBot, deleteBot, runBot, createMatch, finalizeMatch } =
  useAdmin()
const { matches, fetchMatches } = useMatches()

await useAsyncData('admin', () => Promise.all([fetchBots(), fetchMatches()]).then(() => true))

const upcoming = computed(() => matches.value.filter((m) => m.status === 'upcoming'))

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500'

// --- Provision a bot -------------------------------------------------------
const newBot = reactive<CreateBotPayload>({
  name: '',
  apiUrl: '/api/_demo/predict',
  threshold: 0,
  enabled: true,
})
const busy = ref(false)
const notice = ref('')

async function onCreateBot() {
  if (!newBot.name || !newBot.apiUrl) return
  busy.value = true
  try {
    await createBot({ ...newBot })
    newBot.name = ''
    notice.value = 'Bot created.'
  } catch (err) {
    notice.value = apiErrorMessage(err, 'Could not create bot')
  } finally {
    busy.value = false
  }
}

async function onRunBot(id: string) {
  busy.value = true
  try {
    const result = await runBot(id)
    notice.value = `Placed ${result.placed}, skipped ${result.skipped}${
      result.errors.length ? `, ${result.errors.length} error(s)` : ''
    }.`
    await fetchMatches()
  } finally {
    busy.value = false
  }
}

// --- Schedule + finalize matches ------------------------------------------
const newMatch = reactive({ date: '', homeName: '', homeAbbr: '', awayName: '', awayAbbr: '' })

async function onCreateMatch() {
  if (!newMatch.date || !newMatch.homeName || !newMatch.awayName) return
  busy.value = true
  try {
    await createMatch({
      date: new Date(newMatch.date).toISOString(),
      homeTeam: { name: newMatch.homeName, abbreviation: newMatch.homeAbbr },
      awayTeam: { name: newMatch.awayName, abbreviation: newMatch.awayAbbr },
    })
    Object.assign(newMatch, { date: '', homeName: '', homeAbbr: '', awayName: '', awayAbbr: '' })
    await fetchMatches()
  } finally {
    busy.value = false
  }
}

async function onFinalize(matchId: string, winner: MatchSide) {
  busy.value = true
  try {
    await finalizeMatch(matchId, { winner })
    await fetchMatches()
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="space-y-10">
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Admin</h1>
        <p class="text-sm text-slate-500">Provision AI bots and manage the match schedule.</p>
      </div>
      <p v-if="notice" class="text-sm font-medium text-emerald-600">{{ notice }}</p>
    </header>

    <!-- ===================== Bots ===================== -->
    <section class="space-y-4">
      <h2 class="text-lg font-bold text-slate-900">AI Bots</h2>

      <form
        class="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_1fr_auto_auto]"
        @submit.prevent="onCreateBot"
      >
        <input v-model="newBot.name" placeholder="Bot name" required :class="inputClass" />
        <input v-model="newBot.apiUrl" placeholder="Prediction API URL" required :class="inputClass" />
        <input
          v-model.number="newBot.threshold"
          type="number"
          step="0.05"
          min="0"
          max="0.5"
          title="Confidence threshold (0 = always bet)"
          :class="inputClass"
        />
        <button
          type="submit"
          :disabled="busy"
          class="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
        >
          Add bot
        </button>
      </form>

      <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th class="px-4 py-3 font-semibold">Name</th>
              <th class="px-4 py-3 font-semibold">Endpoint</th>
              <th class="px-4 py-3 text-center font-semibold">Threshold</th>
              <th class="px-4 py-3 text-center font-semibold">Enabled</th>
              <th class="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="bot in bots" :key="bot.id">
              <td class="px-4 py-3 font-medium text-slate-800">{{ bot.name }}</td>
              <td class="max-w-[14rem] truncate px-4 py-3 font-mono text-xs text-slate-500">
                {{ bot.apiUrl }}
              </td>
              <td class="px-4 py-3 text-center tabular-nums text-slate-600">{{ bot.threshold }}</td>
              <td class="px-4 py-3 text-center">
                <button
                  type="button"
                  class="rounded-full px-2 py-0.5 text-xs font-semibold"
                  :class="bot.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'"
                  @click="updateBot(bot.id, { enabled: !bot.enabled })"
                >
                  {{ bot.enabled ? 'On' : 'Off' }}
                </button>
              </td>
              <td class="px-4 py-3">
                <div class="flex justify-end gap-2">
                  <button
                    type="button"
                    :disabled="busy"
                    class="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                    @click="onRunBot(bot.id)"
                  >
                    Run now
                  </button>
                  <button
                    type="button"
                    :disabled="busy"
                    class="rounded-lg border border-rose-200 px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                    @click="deleteBot(bot.id)"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!bots.length">
              <td colspan="5" class="px-4 py-8 text-center text-slate-400">No bots yet.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- ===================== Matches ===================== -->
    <section class="space-y-4">
      <h2 class="text-lg font-bold text-slate-900">Schedule</h2>

      <form
        class="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_1fr_1fr_auto]"
        @submit.prevent="onCreateMatch"
      >
        <input v-model="newMatch.date" type="datetime-local" required :class="inputClass" />
        <div class="flex gap-2">
          <input v-model="newMatch.homeName" placeholder="Home team" required :class="inputClass" />
          <input v-model="newMatch.homeAbbr" placeholder="ABB" maxlength="3" class="w-20 rounded-lg border border-slate-300 px-2 py-2 text-sm uppercase" />
        </div>
        <div class="flex gap-2">
          <input v-model="newMatch.awayName" placeholder="Away team" required :class="inputClass" />
          <input v-model="newMatch.awayAbbr" placeholder="ABB" maxlength="3" class="w-20 rounded-lg border border-slate-300 px-2 py-2 text-sm uppercase" />
        </div>
        <button
          type="submit"
          :disabled="busy"
          class="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
        >
          Add match
        </button>
      </form>

      <div class="space-y-2">
        <p class="text-sm font-medium text-slate-500">Upcoming — set a winner to finalize:</p>
        <div
          v-for="match in upcoming"
          :key="match.id"
          class="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
        >
          <span class="text-sm text-slate-700">
            {{ match.awayTeam.abbreviation }} @ {{ match.homeTeam.abbreviation }}
            <span class="ml-2 text-slate-400">{{ new Date(match.date).toLocaleDateString() }}</span>
          </span>
          <div class="flex gap-2">
            <button
              type="button"
              :disabled="busy"
              class="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-50"
              @click="onFinalize(match.id, 'away')"
            >
              {{ match.awayTeam.abbreviation }} won
            </button>
            <button
              type="button"
              :disabled="busy"
              class="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-50"
              @click="onFinalize(match.id, 'home')"
            >
              {{ match.homeTeam.abbreviation }} won
            </button>
          </div>
        </div>
        <p v-if="!upcoming.length" class="text-sm text-slate-400">No upcoming matches.</p>
      </div>
    </section>
  </div>
</template>
