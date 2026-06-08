export type UserRole = 'user' | 'admin'

/**
 * A participant in the platform. Both humans and AI bots are Users, which is
 * what lets the leaderboard rank them in a single, unified list. A bot's
 * account is cross-linked to its {@link Bot} profile via `botId`.
 */
export interface User {
  id: string
  username: string
  email: string
  role: UserRole
  /** True when this account is driven by an AI bot rather than a human. */
  isBot: boolean
  /** Set when `isBot` is true — links to the managing {@link Bot} profile. */
  botId?: string
  /** ISO 8601 timestamp. */
  createdAt: string
}

/**
 * The safe, public projection of a {@link User} — never includes credentials.
 * This is what `/api/auth/me` returns and what lives in client session state.
 */
export type SessionUser = Pick<User, 'id' | 'username' | 'email' | 'role' | 'isBot'>
