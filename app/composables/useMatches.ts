import type { Match } from '#shared/types'

interface Gameday {
  date: string
  matches: Match[]
}

// Match list state. Uses useAsyncData so SSR-fetched data is cached and
// deduped across pages/components by the 'matches' key.
export function useMatches() {
  const { data, pending, refresh, error } = useAsyncData('matches', () =>
    $fetch<{ matches: Match[]; gamedays: Gameday[] }>('/api/matches', {
      query: { status: 'scheduled' },
    }),
  )

  const gamedays = computed<Gameday[]>(() => data.value?.gamedays ?? [])
  const matches = computed<Match[]>(() => data.value?.matches ?? [])

  return { matches, gamedays, pending, error, refresh }
}

// Bet placement is an action, not state — kept separate so any component can
// place a bet and then refresh the relevant list.
export function usePlaceBet() {
  const { fetchUser } = useAuth()
  return async (matchId: string, side: 'home' | 'away', stake: number) => {
    const res = await $fetch('/api/bets', {
      method: 'POST',
      body: { matchId, side, stake },
    })
    await fetchUser() // refresh balance after debit
    return res
  }
}
