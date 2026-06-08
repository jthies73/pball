import { createHmac, randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import type { H3Event } from 'h3'
import type { SessionUser, UserRole } from '~~/shared/types'

/**
 * Authentication primitives built entirely on Node's `node:crypto` — no JWT or
 * bcrypt dependency. Passwords use scrypt; sessions use a compact HS256 token
 * stored in an httpOnly cookie.
 */

const scryptAsync = promisify(scrypt)
const COOKIE_NAME = 'pball_token'
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7 // 7 days

// --- Make `event.context.user` strongly typed across all server code --------
declare module 'h3' {
  interface H3EventContext {
    user?: SessionUser | null
  }
}

// --- Password hashing -------------------------------------------------------

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const derived = (await scryptAsync(password, salt, 64)) as Buffer
  return `${salt}:${derived.toString('hex')}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hashHex] = stored.split(':')
  if (!salt || !hashHex) return false
  const derived = (await scryptAsync(password, salt, 64)) as Buffer
  const expected = Buffer.from(hashHex, 'hex')
  return derived.length === expected.length && timingSafeEqual(derived, expected)
}

// --- Compact HS256 token (JWT-shaped, dependency-free) ----------------------

interface TokenPayload {
  sub: string
  role: UserRole
  iat: number
  exp: number
}

const b64url = (input: string) => Buffer.from(input).toString('base64url')

export function signToken(sub: string, role: UserRole, secret: string): string {
  const iat = Math.floor(Date.now() / 1000)
  const payload: TokenPayload = { sub, role, iat, exp: iat + TOKEN_TTL_SECONDS }
  const head = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = b64url(JSON.stringify(payload))
  const sig = createHmac('sha256', secret).update(`${head}.${body}`).digest('base64url')
  return `${head}.${body}.${sig}`
}

export function verifyToken(token: string, secret: string): TokenPayload | null {
  const [head, body, sig] = token.split('.')
  if (!head || !body || !sig) return null
  const expected = createHmac('sha256', secret).update(`${head}.${body}`).digest('base64url')
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString()) as TokenPayload
    if (payload.exp * 1000 < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

// --- Cookie + runtime helpers ----------------------------------------------

export function getAuthSecret(event: H3Event): string {
  return useRuntimeConfig(event).authSecret as string
}

export function setAuthCookie(event: H3Event, token: string): void {
  setCookie(event, COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: !import.meta.dev,
    path: '/',
    maxAge: TOKEN_TTL_SECONDS,
  })
}

export function clearAuthCookie(event: H3Event): void {
  deleteCookie(event, COOKIE_NAME, { path: '/' })
}

export function readAuthToken(event: H3Event): string | undefined {
  return getCookie(event, COOKIE_NAME)
}

// --- Guards (read from context populated by server middleware) --------------

export function getSessionUser(event: H3Event): SessionUser | null {
  return event.context.user ?? null
}

export function requireUser(event: H3Event): SessionUser {
  const user = getSessionUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  return user
}

export function requireAdmin(event: H3Event): SessionUser {
  const user = requireUser(event)
  if (user.role !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
  return user
}
