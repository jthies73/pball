/**
 * An admin-provisioned AI bot. Each bot is backed by a participant {@link User}
 * account (`userId`) so its bets and leaderboard standing flow through the same
 * paths as a human's.
 */
export interface Bot {
  id: string
  /** Backing participant account used to place bets and appear on the leaderboard. */
  userId: string
  name: string
  /** External endpoint returning a home-team win probability. */
  apiUrl: string
  /** Optional bearer token forwarded to the prediction endpoint (server-only). */
  apiKey?: string
  /**
   * Minimum distance from 0.5 the probability must reach before the bot commits.
   * 0 → always back the favorite; 0.2 → only bet when prob < 0.3 or > 0.7.
   */
  threshold: number
  enabled: boolean
  /** ISO 8601 timestamp. */
  createdAt: string
}

/** Body POSTed to a bot's external prediction endpoint — the public API contract. */
export interface BotPredictionRequest {
  date: string
  home_team: string
  away_team: string
}

/** JSON returned by a bot's external prediction endpoint — the public API contract. */
export interface BotPredictionResponse {
  /** Probability the home team wins, 0..1. */
  home_team_winning_probability: number
}
