export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const match = await getMatchById(id)
  if (!match) throw createError({ statusCode: 404, statusMessage: 'Match not found' })
  return match
})
