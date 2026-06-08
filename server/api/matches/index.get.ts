import type { Match } from '#shared/types'

// GET /api/matches?status=scheduled
// Returns upcoming matches grouped by game day (date).
export default defineEventHandler(async (event) => {
  const { status } = getQuery<{ status?: Match['status'] }>(event)

  let matches = await listMatches()
  if (status) matches = matches.filter((m) => m.status === status)
  matches.sort((a, b) => a.tipoff.localeCompare(b.tipoff))

  // Group into [{ date, matches }] for the gameday view.
  const byDay = new Map<string, Match[]>()
  for (const m of matches) {
    const arr = byDay.get(m.date) ?? []
    arr.push(m)
    byDay.set(m.date, arr)
  }

  return {
    matches,
    gamedays: [...byDay.entries()].map(([date, matches]) => ({ date, matches })),
  }
})
