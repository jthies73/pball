// Core betting mechanics shared by human bet placement and the bot engine.

import type { Bet, BetSide, Bot, Match, UserRecord } from '#shared/types'
import { newId, saveBet, saveUser } from './db'

/** Convert a win probability into fair decimal odds (no house margin, for sim). */
export function probabilityToOdds(p: number): number {
  const clamped = Math.min(Math.max(p, 0.01), 0.99)
  return Math.round((1 / clamped) * 100) / 100
}

export interface PlaceBetInput {
  user: UserRecord
  match: Match
  side: BetSide
  stake: number
  /** Decimal odds locked at placement; defaults to even money. */
  odds?: number
  automated?: boolean
}

/**
 * Validates funds + match state, debits the user's balance, and persists the bet.
 * Returns the created bet. Throws H3 errors on invalid input.
 */
export async function placeBet(input: PlaceBetInput): Promise<Bet> {
  const { user, match, side, stake } = input

  if (match.status !== 'scheduled') {
    throw createError({ statusCode: 409, statusMessage: 'Match is not open for betting' })
  }
  if (stake <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Stake must be positive' })
  }
  if (user.balance < stake) {
    throw createError({ statusCode: 402, statusMessage: 'Insufficient balance' })
  }

  user.balance -= stake
  await saveUser(user)

  const bet: Bet = {
    id: newId(),
    userId: user.id,
    matchId: match.id,
    side,
    stake,
    odds: input.odds ?? 2.0,
    status: 'open',
    automated: input.automated ?? false,
    createdAt: new Date().toISOString(),
  }
  return saveBet(bet)
}

export interface BotDecision {
  shouldBet: boolean
  side?: BetSide
  stake?: number
  /** The home win probability the decision was based on. */
  homeProbability: number
  confidence: number
}

/**
 * Pure decision function: given a bot's strategy and the model's home-win
 * probability, decide whether to bet, on which side, and how much.
 */
export function decideBet(bot: Bot, homeProbability: number): BotDecision {
  // Confidence = distance of the favorite from a coin flip.
  const side: BetSide = homeProbability >= 0.5 ? 'home' : 'away'
  const confidence = side === 'home' ? homeProbability : 1 - homeProbability

  if (confidence < bot.strategy.minConfidence) {
    return { shouldBet: false, homeProbability, confidence }
  }
  return {
    shouldBet: true,
    side,
    stake: bot.strategy.stakePerBet,
    homeProbability,
    confidence,
  }
}
