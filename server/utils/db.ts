import type { Bet, Bot, Match, User } from '~~/shared/types'

/**
 * Persistence layer. Intentionally thin: it wraps Nitro's built-in
 * `useStorage()` (unstorage) so the scaffold ships with **zero database
 * dependencies**. Each entity is stored under `db:<collection>:<id>`.
 *
 * To make it durable / scalable later, point the `db` mount at any unstorage
 * driver in `nuxt.config.ts` (fs, redis, cloudflare-kv, postgres, …) — no code
 * here changes. See `nitro.storage` in the config.
 */

/** A {@link User} as persisted server-side, including the credential hash. */
export type StoredUser = User & { passwordHash: string }

interface Entity {
  id: string
}

function collection<T extends Entity>(name: string) {
  // `useStorage` is resolved inside each method so it always runs within the
  // Nitro runtime context, never at module-eval time.
  const store = () => useStorage<T>('db')
  const key = (id: string) => `${name}:${id}`

  return {
    async all(): Promise<T[]> {
      const storage = store()
      const keys = await storage.getKeys(name)
      const items = await Promise.all(keys.map((k) => storage.getItem(k)))
      return items.filter((x): x is T => x != null)
    },
    async get(id: string): Promise<T | null> {
      return (await store().getItem(key(id))) ?? null
    },
    async set(item: T): Promise<T> {
      await store().setItem(key(item.id), item)
      return item
    },
    async remove(id: string): Promise<void> {
      await store().removeItem(key(id))
    },
    async find(predicate: (item: T) => boolean): Promise<T[]> {
      return (await this.all()).filter(predicate)
    },
    async findOne(predicate: (item: T) => boolean): Promise<T | null> {
      return (await this.all()).find(predicate) ?? null
    },
  }
}

/** Typed entry point for all data access. Auto-imported in every server route. */
export const db = {
  users: collection<StoredUser>('users'),
  matches: collection<Match>('matches'),
  bets: collection<Bet>('bets'),
  bots: collection<Bot>('bots'),
}

/** Strips the credential hash before a user record ever leaves the server. */
export function toPublicUser(user: StoredUser): User {
  const { passwordHash, ...safe } = user
  return safe
}
