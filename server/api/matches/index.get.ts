import type { Match, MatchStatus } from '~~/shared/types'

/**
 * Lists matches, optionally filtered by `?status=upcoming|final`.
 * Upcoming matches are ordered soonest-first; finals most-recent-first.
 */
export default defineEventHandler(async (event): Promise<Match[]> => {
  const { status } = getQuery(event)
  let matches = await db.matches.all()

  if (status === 'upcoming' || status === 'final') {
    matches = matches.filter((m) => m.status === (status as MatchStatus))
  }

  const phase = (m: Match) => (m.status === 'upcoming' ? 0 : 1)
  return matches.sort((a, b) => {
    if (phase(a) !== phase(b)) return phase(a) - phase(b)
    const ta = new Date(a.date).getTime()
    const tb = new Date(b.date).getTime()
    return a.status === 'upcoming' ? ta - tb : tb - ta
  })
})
