import { randomBytes, scryptSync, timingSafeEqual, createHmac } from 'node:crypto'
import type { H3Event } from 'h3'
import type { PublicUser, UserRecord } from '#shared/types'
import { getUserById } from './db'

const SESSION_COOKIE = 'pb_session'
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7 // 7 days

// --- Password hashing (scrypt, built into Node) --------------------------

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const derived = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${derived}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, key] = stored.split(':')
  if (!salt || !key) return false
  const derived = scryptSync(password, salt, 64)
  const keyBuf = Buffer.from(key, 'hex')
  return keyBuf.length === derived.length && timingSafeEqual(keyBuf, derived)
}

// --- Stateless signed session token (tiny JWT-like, HMAC-SHA256) ---------

interface SessionPayload {
  sub: string // user id
  exp: number // unix seconds
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64url')
}

function sign(payload: SessionPayload, secret: string): string {
  const body = b64url(JSON.stringify(payload))
  const sig = createHmac('sha256', secret).update(body).digest('base64url')
  return `${body}.${sig}`
}

function verify(token: string, secret: string): SessionPayload | null {
  const [body, sig] = token.split('.')
  if (!body || !sig) return null
  const expected = createHmac('sha256', secret).update(body).digest('base64url')
  // Constant-time comparison of signatures.
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString()) as SessionPayload
    if (payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}

// --- Cookie helpers -------------------------------------------------------

export function setUserSession(event: H3Event, userId: string): void {
  const secret = useRuntimeConfig(event).sessionSecret
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS
  const token = sign({ sub: userId, exp }, secret)
  setCookie(event, SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: !import.meta.dev,
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  })
}

export function clearUserSession(event: H3Event): void {
  deleteCookie(event, SESSION_COOKIE, { path: '/' })
}

/** Resolve the current user from the session cookie, or null. */
export async function getSessionUser(event: H3Event): Promise<PublicUser | null> {
  const token = getCookie(event, SESSION_COOKIE)
  if (!token) return null
  const payload = verify(token, useRuntimeConfig(event).sessionSecret)
  if (!payload) return null
  const user = await getUserById(payload.sub)
  return user ? toPublicUser(user) : null
}

export function toPublicUser(user: UserRecord): PublicUser {
  const { passwordHash, ...rest } = user
  return rest
}

// --- Guards (throw 401/403) ----------------------------------------------

export async function requireUser(event: H3Event): Promise<PublicUser> {
  const user = event.context.user ?? (await getSessionUser(event))
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  return user
}

export async function requireAdmin(event: H3Event): Promise<PublicUser> {
  const user = await requireUser(event)
  if (user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
  }
  return user
}
