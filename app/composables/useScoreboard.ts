import type { LeaderboardEntry } from '~~/shared/types'

/** Global leaderboard state — shared between the home widget and the full page. */
export function useScoreboard() {
  const entries = useState<LeaderboardEntry[]>('scoreboard:entries', () => [])
  const pending = useState<boolean>('scoreboard:pending', () => false)

  async function fetchScoreboard(): Promise<void> {
    pending.value = true
    try {
      entries.value = await $fetch<LeaderboardEntry[]>('/api/leaderboard')
    } finally {
      pending.value = false
    }
  }

  return { entries, pending, fetchScoreboard }
}
