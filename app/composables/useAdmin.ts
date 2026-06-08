import type {
  Bot,
  BotRunResult,
  CreateBotPayload,
  CreateMatchPayload,
  FinalizeMatchPayload,
  Match,
  UpdateBotPayload,
} from '~~/shared/types'

/** Admin actions: bot provisioning/management and match scheduling/finalization. */
export function useAdmin() {
  const bots = useState<Bot[]>('admin:bots', () => [])

  async function fetchBots(): Promise<void> {
    bots.value = await $fetch<Bot[]>('/api/admin/bots')
  }

  async function createBot(payload: CreateBotPayload): Promise<Bot> {
    const bot = await $fetch<Bot>('/api/admin/bots', { method: 'POST', body: payload })
    bots.value.push(bot)
    return bot
  }

  async function updateBot(id: string, payload: UpdateBotPayload): Promise<Bot> {
    const bot = await $fetch<Bot>(`/api/admin/bots/${id}`, { method: 'PUT', body: payload })
    const index = bots.value.findIndex((b) => b.id === id)
    if (index >= 0) bots.value[index] = bot
    return bot
  }

  async function deleteBot(id: string): Promise<void> {
    await $fetch(`/api/admin/bots/${id}`, { method: 'DELETE' })
    bots.value = bots.value.filter((b) => b.id !== id)
  }

  function runBot(id: string): Promise<BotRunResult> {
    return $fetch<BotRunResult>(`/api/admin/bots/${id}/run`, { method: 'POST' })
  }

  function createMatch(payload: CreateMatchPayload): Promise<Match> {
    return $fetch<Match>('/api/admin/matches', { method: 'POST', body: payload })
  }

  function finalizeMatch(id: string, payload: FinalizeMatchPayload): Promise<Match> {
    return $fetch<Match>(`/api/admin/matches/${id}/result`, { method: 'POST', body: payload })
  }

  return { bots, fetchBots, createBot, updateBot, deleteBot, runBot, createMatch, finalizeMatch }
}
