<script setup lang="ts">
import type { LeaderboardEntry } from '~~/shared/types'

const props = defineProps<{
  entries: LeaderboardEntry[]
  /** Show only the top N rows (e.g. for a home-page widget). */
  limit?: number
  /** Highlights the current user's row. */
  highlightUserId?: string
}>()

const rows = computed(() => (props.limit ? props.entries.slice(0, props.limit) : props.entries))

const pct = (value: number) => `${Math.round(value * 100)}%`
const medal = (rank: number) =>
  ({ 1: '🥇', 2: '🥈', 3: '🥉' } as Record<number, string>)[rank] ?? null
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <table class="w-full text-sm">
      <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
        <tr>
          <th class="px-4 py-3 font-semibold">#</th>
          <th class="px-4 py-3 font-semibold">Player</th>
          <th class="px-4 py-3 text-right font-semibold">Accuracy</th>
          <th class="px-4 py-3 text-right font-semibold">Record</th>
          <th class="px-4 py-3 text-right font-semibold">Points</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100">
        <tr
          v-for="entry in rows"
          :key="entry.userId"
          :class="entry.userId === highlightUserId ? 'bg-emerald-50/70' : ''"
        >
          <td class="px-4 py-3 font-semibold text-slate-500">
            {{ medal(entry.rank) ?? entry.rank }}
          </td>
          <td class="px-4 py-3">
            <span class="flex items-center gap-2">
              <span class="font-medium text-slate-800">{{ entry.username }}</span>
              <span
                v-if="entry.isBot"
                class="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-indigo-600"
              >
                Bot
              </span>
            </span>
          </td>
          <td class="px-4 py-3 text-right tabular-nums text-slate-600">{{ pct(entry.accuracy) }}</td>
          <td class="px-4 py-3 text-right tabular-nums text-slate-500">
            {{ entry.correctBets }}/{{ entry.totalBets }}
          </td>
          <td class="px-4 py-3 text-right font-semibold tabular-nums text-slate-900">
            {{ entry.points }}
          </td>
        </tr>
        <tr v-if="!rows.length">
          <td colspan="5" class="px-4 py-8 text-center text-slate-400">No ranked players yet.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
