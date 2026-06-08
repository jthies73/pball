<script setup lang="ts">
import type { Team } from '~~/shared/types'

withDefaults(
  defineProps<{
    team: Team
    score?: number
    /** True when this team won a finalized match. */
    winner?: boolean
    /** True once the match is final (shows scores, dims the loser). */
    final?: boolean
    /** Renders the "Home" indicator. */
    home?: boolean
    align?: 'left' | 'right'
  }>(),
  { align: 'left' },
)
</script>

<template>
  <div
    class="flex items-center gap-3"
    :class="align === 'right' ? 'flex-row-reverse text-right' : 'text-left'"
  >
    <span
      class="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xs font-bold text-white"
      :class="final && winner ? 'bg-emerald-600' : 'bg-slate-900'"
    >
      {{ team.abbreviation }}
    </span>

    <div class="min-w-0">
      <p
        class="truncate text-sm font-semibold"
        :class="final && !winner ? 'text-slate-400' : 'text-slate-900'"
      >
        {{ team.name }}
      </p>
      <p
        class="mt-0.5 flex items-center gap-1.5"
        :class="align === 'right' ? 'justify-end' : ''"
      >
        <span
          v-if="home"
          class="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sky-700"
        >
          Home
        </span>
        <span
          v-if="final"
          class="text-lg font-bold leading-none tabular-nums"
          :class="winner ? 'text-emerald-600' : 'text-slate-400'"
        >
          {{ score ?? '–' }}
        </span>
      </p>
    </div>
  </div>
</template>
