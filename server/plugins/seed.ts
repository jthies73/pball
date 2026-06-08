// Dev-only seed: a default admin + a couple of upcoming gamedays so the
// scaffold is usable on first `npm run dev`. Runs once; no-ops if data exists.

import type { Match, UserRecord } from '#shared/types'

export default defineNitroPlugin(async () => {
  if (!import.meta.dev) return

  const users = await listUsers()
  if (users.length === 0) {
    const admin: UserRecord = {
      id: newId(),
      email: 'admin@pball.local',
      displayName: 'Admin',
      role: 'admin',
      balance: 0,
      isBot: false,
      createdAt: new Date().toISOString(),
      passwordHash: hashPassword('admin1234'),
    }
    await saveUser(admin)
    console.info('[seed] admin@pball.local / admin1234')
  }

  const matches = await listMatches()
  if (matches.length === 0) {
    const seedMatches: Array<Omit<Match, 'id'>> = [
      mk('2026-06-10', '19:30', 'Boston Celtics', 'Miami Heat'),
      mk('2026-06-10', '22:00', 'Denver Nuggets', 'Phoenix Suns'),
      mk('2026-06-12', '20:00', 'Milwaukee Bucks', 'New York Knicks'),
    ]
    for (const m of seedMatches) await saveMatch({ id: newId(), ...m })
    console.info(`[seed] ${seedMatches.length} matches`)
  }
})

function mk(date: string, time: string, homeTeam: string, awayTeam: string): Omit<Match, 'id'> {
  return {
    date,
    tipoff: `${date}T${time}:00Z`,
    homeTeam,
    awayTeam,
    status: 'scheduled',
  }
}
