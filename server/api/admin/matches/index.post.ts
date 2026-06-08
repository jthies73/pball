import type { CreateMatchPayload, Match } from '~~/shared/types'

/** Adds a match to the schedule (admin). New matches start as "upcoming". */
export default defineEventHandler(async (event): Promise<Match> => {
  requireAdmin(event)
  const body = await readBody<CreateMatchPayload>(event)

  if (!body?.date || !body.homeTeam?.name || !body.awayTeam?.name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'date, homeTeam.name and awayTeam.name are required',
    })
  }

  return db.matches.set({
    id: newId(),
    date: new Date(body.date).toISOString(),
    homeTeam: {
      id: newId(),
      name: body.homeTeam.name.trim(),
      abbreviation: body.homeTeam.abbreviation?.trim() || body.homeTeam.name.slice(0, 3).toUpperCase(),
    },
    awayTeam: {
      id: newId(),
      name: body.awayTeam.name.trim(),
      abbreviation: body.awayTeam.abbreviation?.trim() || body.awayTeam.name.slice(0, 3).toUpperCase(),
    },
    status: 'upcoming',
  })
})
