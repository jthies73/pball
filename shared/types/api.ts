import type { MatchSide } from './match'
import type { Match } from './match'
import type { BetBreakdownEntry } from './bet'
import type { SessionUser } from './user'

// --- Auth ---------------------------------------------------------------

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload extends LoginPayload {
  username: string
}

/** Envelope returned by `/api/auth/me`, `login`, and `register`. */
export interface AuthResponse {
  user: SessionUser | null
}

// --- Bets ---------------------------------------------------------------

export interface PlaceBetPayload {
  matchId: string
  side: MatchSide
}

// --- Matches ------------------------------------------------------------

/** Response of `/api/matches/[id]` — the match plus its full voting breakdown. */
export interface MatchDetailResponse {
  match: Match
  breakdown: BetBreakdownEntry[]
}

// --- Bots (admin) -------------------------------------------------------

export interface CreateBotPayload {
  name: string
  apiUrl: string
  apiKey?: string
  /** Defaults to 0 (always back the favorite) when omitted. */
  threshold?: number
  /** Defaults to true. */
  enabled?: boolean
}

export type UpdateBotPayload = Partial<CreateBotPayload>

/** Result of triggering a bot run — how many bets it placed and skipped. */
export interface BotRunResult {
  botId: string
  placed: number
  skipped: number
  errors: string[]
}

// --- Matches (admin) ----------------------------------------------------

export interface CreateMatchPayload {
  /** ISO 8601 datetime of tip-off. */
  date: string
  homeTeam: { name: string; abbreviation: string }
  awayTeam: { name: string; abbreviation: string }
}

export interface FinalizeMatchPayload {
  winner: MatchSide
  homeScore?: number
  awayScore?: number
}
