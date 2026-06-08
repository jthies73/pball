import type { BotPredictionRequest, BotPredictionResponse } from '~~/shared/types'

/**
 * A stand-in for an external prediction service so a seeded bot works with zero
 * setup. It implements the exact public contract — POST { date, home_team,
 * away_team } → { home_team_winning_probability } — deriving a *stable*
 * pseudo-probability from the matchup so results are reproducible.
 *
 * Point a real bot's `apiUrl` at your own model; delete this in production.
 */
export default defineEventHandler(async (event): Promise<BotPredictionResponse> => {
  const body = await readBody<BotPredictionRequest>(event)
  const seed = `${body?.home_team}|${body?.away_team}|${body?.date}`

  // FNV-1a hash → deterministic value in [0,1)
  let hash = 2166136261
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  const unit = (hash >>> 0) / 0xffffffff

  // Squeeze into 0.15..0.85 so the pick is decisive but never a certainty.
  const probability = 0.15 + unit * 0.7
  return { home_team_winning_probability: Math.round(probability * 1000) / 1000 }
})
