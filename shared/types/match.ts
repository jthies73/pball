export interface Team {
  id: string
  name: string
  /** Three-letter code, e.g. "LAL", "BOS". */
  abbreviation: string
}

export type MatchStatus = 'upcoming' | 'final'

/** Which side of a match a result or bet refers to. */
export type MatchSide = 'home' | 'away'

export interface Match {
  id: string
  /** ISO 8601 datetime of tip-off. */
  date: string
  homeTeam: Team
  awayTeam: Team
  status: MatchStatus
  /** Populated once `status` is "final". */
  winner?: MatchSide
  homeScore?: number
  awayScore?: number
}
