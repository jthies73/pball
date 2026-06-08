// Client for the external AI win-probability service.
//
// Contract:
//   POST <aiApiUrl>  { date, home_team, away_team }
//   ->   { home_team_winning_probability: number /* 0..1 */ }
//
// If no URL is configured we fall back to a deterministic stub so the scaffold
// runs end-to-end in development without a live model.

import type {
  Match,
  ProbabilityRequest,
  ProbabilityResponse,
} from '#shared/types'

export async function fetchWinProbability(match: Match): Promise<number> {
  const { aiApiUrl, aiApiKey } = useRuntimeConfig()

  const payload: ProbabilityRequest = {
    date: match.date,
    home_team: match.homeTeam,
    away_team: match.awayTeam,
  }

  if (!aiApiUrl) {
    return stubProbability(match)
  }

  const res = await $fetch<ProbabilityResponse>(aiApiUrl, {
    method: 'POST',
    body: payload,
    headers: aiApiKey ? { Authorization: `Bearer ${aiApiKey}` } : undefined,
  })

  const p = res?.home_team_winning_probability
  if (typeof p !== 'number' || p < 0 || p > 1 || Number.isNaN(p)) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Probability API returned an invalid payload',
    })
  }
  return p
}

/** Deterministic, seeded-by-teams pseudo-probability for local dev only. */
function stubProbability(match: Match): number {
  const seed = `${match.date}:${match.homeTeam}:${match.awayTeam}`
  let h = 0
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  // Map hash into a plausible 0.35–0.75 home-win range.
  return 0.35 + (h % 400) / 1000
}
