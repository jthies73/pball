import type { MatchSide } from './match'

export interface Bet {
  id: string
  matchId: string
  /** The participant ({@link User}) who placed the bet — human or bot. */
  userId: string
  /** The team predicted to win. */
  side: MatchSide
  /** 0..1 model confidence; bots derive this from the prediction API. Humans omit it. */
  confidence?: number
  /** ISO 8601 timestamp. */
  createdAt: string
  /** Resolved once the match is final. */
  isCorrect?: boolean
}

/**
 * A bet enriched with participant identity, used to render the expanded
 * breakdown on a past {@link Match} ("how everyone voted").
 */
export interface BetBreakdownEntry {
  betId: string
  userId: string
  username: string
  isBot: boolean
  side: MatchSide
  confidence?: number
  isCorrect?: boolean
}
