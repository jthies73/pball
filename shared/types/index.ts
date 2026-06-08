// Shared data models — visible to both the Nuxt app (client) and Nitro server.
// In Nuxt 4 the `shared/` dir is auto-aliased; import via `#shared/types`.

export type Role = 'user' | 'admin'

export interface User {
  id: string
  email: string
  displayName: string
  role: Role
  /** Virtual currency balance used to back bets. */
  balance: number
  /** Marks accounts that are driven by an AI bot rather than a human. */
  isBot: boolean
  createdAt: string // ISO timestamp
}

/** What we persist for a user — includes the password hash, never sent to the client. */
export interface UserRecord extends User {
  passwordHash: string
}

/** Safe projection returned by the API (no secrets). */
export type PublicUser = Omit<UserRecord, 'passwordHash'>

export type MatchStatus = 'scheduled' | 'live' | 'final'

export interface Match {
  id: string
  /** Game day, ISO date (YYYY-MM-DD) — used for grouping and the probability API. */
  date: string
  tipoff: string // ISO timestamp
  homeTeam: string
  awayTeam: string
  status: MatchStatus
  /** Populated once status === 'final'. */
  result?: {
    homeScore: number
    awayScore: number
    winner: 'home' | 'away'
  }
}

export type BetSide = 'home' | 'away'
export type BetStatus = 'open' | 'won' | 'lost'

export interface Bet {
  id: string
  userId: string
  matchId: string
  side: BetSide
  /** Wagered amount of virtual currency. */
  stake: number
  /** Decimal odds locked in at placement time (payout = stake * odds). */
  odds: number
  status: BetStatus
  /** True when placed automatically by a bot engine run. */
  automated: boolean
  createdAt: string
  settledAt?: string
}

export interface Bot {
  id: string
  /** The bot's own user account — bets are placed against this user's balance. */
  userId: string
  name: string
  /** Owning admin who provisioned the bot. */
  ownerId: string
  enabled: boolean
  /** Strategy knobs the engine reads when deciding whether/how much to bet. */
  strategy: {
    /** Only bet when the model's edge clears this confidence (e.g. 0.6). */
    minConfidence: number
    /** Fixed stake per qualifying match. */
    stakePerBet: number
  }
  createdAt: string
  lastRunAt?: string
}

// ---------------------------------------------------------------------------
// External AI probability API contract
// ---------------------------------------------------------------------------

export interface ProbabilityRequest {
  date: string
  home_team: string
  away_team: string
}

export interface ProbabilityResponse {
  /** Float in [0, 1]. */
  home_team_winning_probability: number
}
