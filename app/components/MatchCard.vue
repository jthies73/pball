<script setup lang="ts">
import type { BetBreakdownEntry, Match, MatchSide } from '~~/shared/types'

const props = defineProps<{ match: Match }>()

const { isLoggedIn } = useAuth()
const { betFor, placeBet, fetchMatch } = useMatches()

const isUpcoming = computed(() => props.match.status === 'upcoming')
const myBet = computed(() => betFor(props.match.id))

const dateLabel = computed(() =>
  new Date(props.match.date).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }),
)

const abbrFor = (side: MatchSide) =>
  side === 'home' ? props.match.homeTeam.abbreviation : props.match.awayTeam.abbreviation

// --- Betting (upcoming only) ----------------------------------------------
const submitting = ref<MatchSide | null>(null)
async function pick(side: MatchSide) {
  if (!isLoggedIn.value) {
    await navigateTo('/login')
    return
  }
  submitting.value = side
  try {
    await placeBet({ matchId: props.match.id, side })
  } finally {
    submitting.value = null
  }
}

// --- Voting breakdown (past matches, lazy-loaded on expand) ----------------
const expanded = ref(false)
const breakdown = ref<BetBreakdownEntry[] | null>(null)
const loadingBreakdown = ref(false)

async function toggle() {
  expanded.value = !expanded.value
  if (expanded.value && breakdown.value === null) {
    loadingBreakdown.value = true
    try {
      breakdown.value = (await fetchMatch(props.match.id)).breakdown
    } finally {
      loadingBreakdown.value = false
    }
  }
}

const confidencePct = (entry: BetBreakdownEntry) =>
  entry.confidence === undefined ? null : Math.round(entry.confidence * 100)
</script>

<template>
  <article class="rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
    <!-- Header: date + status -->
    <div class="flex items-center justify-between px-5 pt-4">
      <time class="text-sm font-medium text-slate-500">{{ dateLabel }}</time>
      <span
        class="rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide"
        :class="isUpcoming ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'"
      >
        {{ isUpcoming ? 'Upcoming' : 'Final' }}
      </span>
    </div>

    <!-- Matchup -->
    <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-5 py-4">
      <TeamBlock
        :team="match.awayTeam"
        :score="match.awayScore"
        :winner="match.winner === 'away'"
        :final="!isUpcoming"
        align="right"
      />
      <span class="text-xs font-bold text-slate-400">@</span>
      <TeamBlock
        :team="match.homeTeam"
        :score="match.homeScore"
        :winner="match.winner === 'home'"
        :final="!isUpcoming"
        home
      />
    </div>

    <!-- Upcoming: bet controls -->
    <template v-if="isUpcoming">
      <div class="flex gap-2 border-t border-slate-100 px-5 py-3">
        <button
          v-for="side in (['away', 'home'] as MatchSide[])"
          :key="side"
          type="button"
          :disabled="submitting !== null"
          class="flex-1 rounded-xl border px-3 py-2 text-sm font-semibold transition disabled:opacity-50"
          :class="
            myBet?.side === side
              ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
              : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
          "
          @click="pick(side)"
        >
          <span v-if="submitting === side">…</span>
          <span v-else>{{ myBet?.side === side ? '✓ ' : '' }}{{ abbrFor(side) }}</span>
        </button>
      </div>
      <p v-if="!isLoggedIn" class="px-5 pb-3 text-xs text-slate-400">
        <NuxtLink to="/login" class="font-medium text-emerald-600 hover:underline">Log in</NuxtLink>
        to place a bet.
      </p>
    </template>

    <!-- Past: expandable voting breakdown -->
    <div v-else class="border-t border-slate-100">
      <button
        type="button"
        class="flex w-full items-center justify-between px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
        :aria-expanded="expanded"
        @click="toggle"
      >
        <span>How everyone voted</span>
        <span class="transition-transform" :class="expanded ? 'rotate-180' : ''">▾</span>
      </button>

      <div v-if="expanded" class="px-5 pb-4">
        <p v-if="loadingBreakdown" class="py-2 text-sm text-slate-400">Loading…</p>
        <p v-else-if="!breakdown?.length" class="py-2 text-sm text-slate-400">
          No bets were placed on this match.
        </p>
        <ul v-else class="divide-y divide-slate-100">
          <li
            v-for="entry in breakdown"
            :key="entry.betId"
            class="flex items-center justify-between py-2 text-sm"
          >
            <span class="flex items-center gap-2">
              <span class="font-medium text-slate-700">{{ entry.username }}</span>
              <span
                v-if="entry.isBot"
                class="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-indigo-600"
              >
                Bot
              </span>
            </span>
            <span class="flex items-center gap-3">
              <span class="text-slate-500">
                {{ abbrFor(entry.side) }}
                <template v-if="confidencePct(entry) !== null"> · {{ confidencePct(entry) }}%</template>
              </span>
              <span
                class="w-4 text-center font-semibold"
                :class="entry.isCorrect ? 'text-emerald-600' : 'text-rose-500'"
              >
                {{ entry.isCorrect ? '✓' : '✗' }}
              </span>
            </span>
          </li>
        </ul>
      </div>
    </div>
  </article>
</template>
