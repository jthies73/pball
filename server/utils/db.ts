// Thin repository layer over Nitro's built-in `useStorage()` (unstorage).
// Default driver is in-memory/fs; swap to Redis/Postgres later via nitro.storage
// config WITHOUT touching call sites. Zero external dependencies.

import { randomUUID } from 'node:crypto'
import type { Bet, Bot, Match, UserRecord } from '#shared/types'

const db = () => useStorage('db')

export const newId = () => randomUUID()

// Generic helpers: each "collection" is a flat keyspace `coll:id`.
async function list<T>(coll: string): Promise<T[]> {
  const keys = await db().getKeys(coll)
  const items = await Promise.all(keys.map((k) => db().getItem<T>(k)))
  return items.filter((x) => x !== null) as T[]
}

async function get<T>(coll: string, id: string): Promise<T | null> {
  return db().getItem<T>(`${coll}:${id}`)
}

async function put<T extends { id: string }>(coll: string, item: T): Promise<T> {
  await db().setItem(`${coll}:${item.id}`, item)
  return item
}

async function remove(coll: string, id: string): Promise<void> {
  await db().removeItem(`${coll}:${id}`)
}

// --- Users ----------------------------------------------------------------

export const getUserById = (id: string) => get<UserRecord>('users', id)
export const listUsers = () => list<UserRecord>('users')
export const saveUser = (u: UserRecord) => put('users', u)

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  const users = await listUsers()
  const target = email.toLowerCase()
  return users.find((u) => u.email.toLowerCase() === target) ?? null
}

// --- Matches --------------------------------------------------------------

export const getMatchById = (id: string) => get<Match>('matches', id)
export const listMatches = () => list<Match>('matches')
export const saveMatch = (m: Match) => put('matches', m)

// --- Bets -----------------------------------------------------------------

export const getBetById = (id: string) => get<Bet>('bets', id)
export const listBets = () => list<Bet>('bets')
export const saveBet = (b: Bet) => put('bets', b)

export async function listBetsByUser(userId: string): Promise<Bet[]> {
  return (await listBets()).filter((b) => b.userId === userId)
}

// --- Bots -----------------------------------------------------------------

export const getBotById = (id: string) => get<Bot>('bots', id)
export const listBots = () => list<Bot>('bots')
export const saveBot = (b: Bot) => put('bots', b)
export const deleteBot = (id: string) => remove('bots', id)
