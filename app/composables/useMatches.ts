import type { Bet, Match, MatchDetailResponse, MatchStatus, PlaceBetPayload } from '~~/shared/types'

/**
 * Match schedule + the current user's bets. The list and bets live in
 * `useState` so the home page and individual cards share one source of truth.
 */
export function useMatches() {
  const matches = useState<Match[]>('matches:list', () => [])
  const myBets = useState<Bet[]>('matches:myBets', () => [])
  const pending = useState<boolean>('matches:pending', () => false)

  const upcoming = computed(() => matches.value.filter((m) => m.status === 'upcoming'))
  const past = computed(() => matches.value.filter((m) => m.status === 'final'))

  async function fetchMatches(status?: MatchStatus): Promise<void> {
    pending.value = true
    try {
      matches.value = await $fetch<Match[]>('/api/matches', {
        query: status ? { status } : undefined,
      })
    } finally {
      pending.value = false
    }
  }

  function fetchMatch(id: string): Promise<MatchDetailResponse> {
    return $fetch<MatchDetailResponse>(`/api/matches/${id}`)
  }

  async function fetchMyBets(): Promise<void> {
    myBets.value = await $fetch<Bet[]>('/api/bets')
  }

  async function placeBet(payload: PlaceBetPayload): Promise<Bet> {
    const bet = await $fetch<Bet>('/api/bets', { method: 'POST', body: payload })
    const index = myBets.value.findIndex((b) => b.matchId === bet.matchId)
    if (index >= 0) myBets.value[index] = bet
    else myBets.value.push(bet)
    return bet
  }

  /** The current user's existing pick for a match, if any. */
  function betFor(matchId: string): Bet | null {
    return myBets.value.find((b) => b.matchId === matchId) ?? null
  }

  return {
    matches, myBets, pending, upcoming, past,
    fetchMatches, fetchMatch, fetchMyBets, placeBet, betFor,
  }
}
