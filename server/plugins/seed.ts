import type { Bet, Match, MatchSide, Team } from '~~/shared/types'

/**
 * Seeds demo data on first boot so the app is explorable immediately. Runs once
 * (guarded by a `meta:seeded` flag) and is a no-op thereafter. Safe to delete.
 *
 * Demo logins:  admin@pball.local / admin12345   ·   alice@pball.local / password123
 */
export default defineNitroPlugin(async () => {
  const storage = useStorage('db')
  if (await storage.getItem('meta:seeded')) return

  const team = (name: string, abbreviation: string): Team => ({ id: newId(), name, abbreviation })
  const LAL = team('Los Angeles Lakers', 'LAL')
  const BOS = team('Boston Celtics', 'BOS')
  const GSW = team('Golden State Warriors', 'GSW')
  const MIA = team('Miami Heat', 'MIA')
  const DEN = team('Denver Nuggets', 'DEN')
  const NYK = team('New York Knicks', 'NYK')

  // --- Matches: two resolved, two open ------------------------------------
  const final1: Match = {
    id: newId(), date: '2026-06-02T23:30:00.000Z', homeTeam: LAL, awayTeam: BOS,
    status: 'final', winner: 'home', homeScore: 112, awayScore: 104,
  }
  const final2: Match = {
    id: newId(), date: '2026-06-05T23:30:00.000Z', homeTeam: GSW, awayTeam: MIA,
    status: 'final', winner: 'away', homeScore: 99, awayScore: 107,
  }
  const upcoming1: Match = {
    id: newId(), date: '2026-06-12T23:30:00.000Z', homeTeam: DEN, awayTeam: NYK, status: 'upcoming',
  }
  const upcoming2: Match = {
    id: newId(), date: '2026-06-14T23:00:00.000Z', homeTeam: BOS, awayTeam: GSW, status: 'upcoming',
  }
  for (const m of [final1, final2, upcoming1, upcoming2]) await db.matches.set(m)

  // --- Participants --------------------------------------------------------
  const admin = {
    id: newId(), username: 'admin', email: 'admin@pball.local', role: 'admin' as const,
    isBot: false, createdAt: '2026-05-01T00:00:00.000Z', passwordHash: await hashPassword('admin12345'),
  }
  const alice = {
    id: newId(), username: 'alice', email: 'alice@pball.local', role: 'user' as const,
    isBot: false, createdAt: '2026-05-02T00:00:00.000Z', passwordHash: await hashPassword('password123'),
  }
  const bob = {
    id: newId(), username: 'bob', email: 'bob@pball.local', role: 'user' as const,
    isBot: false, createdAt: '2026-05-03T00:00:00.000Z', passwordHash: await hashPassword('password123'),
  }
  for (const u of [admin, alice, bob]) await db.users.set(u)

  // --- A demo bot wired to the built-in mock prediction endpoint -----------
  const botUserId = newId()
  const botId = newId()
  await db.users.set({
    id: botUserId, username: 'QuantBot', email: `${botId}@bots.pball.local`,
    role: 'user', isBot: true, botId, createdAt: '2026-05-04T00:00:00.000Z',
    passwordHash: await hashPassword(newId()),
  })
  await db.bots.set({
    id: botId, userId: botUserId, name: 'QuantBot',
    apiUrl: '/api/_demo/predict', threshold: 0, enabled: true,
    createdAt: '2026-05-04T00:00:00.000Z',
  })

  // --- Bets (resolved bets feed the leaderboard) ---------------------------
  const bet = (
    matchId: string, userId: string, side: MatchSide,
    winner: MatchSide | undefined, confidence?: number,
  ): Bet => ({
    id: newId(), matchId, userId, side, confidence,
    createdAt: '2026-06-01T00:00:00.000Z',
    isCorrect: winner === undefined ? undefined : side === winner,
  })

  const seedBets: Bet[] = [
    // final1 → LAL (home) won
    bet(final1.id, alice.id, 'home', final1.winner),
    bet(final1.id, bob.id, 'away', final1.winner),
    bet(final1.id, botUserId, 'home', final1.winner, 0.72),
    // final2 → MIA (away) won
    bet(final2.id, alice.id, 'home', final2.winner),
    bet(final2.id, bob.id, 'away', final2.winner),
    bet(final2.id, botUserId, 'away', final2.winner, 0.61),
    // open match — unresolved
    bet(upcoming1.id, alice.id, 'home', undefined),
  ]
  for (const b of seedBets) await db.bets.set(b)

  await storage.setItem('meta:seeded', true)
  console.log('[seed] pball demo data created (admin@pball.local / admin12345)')
})
