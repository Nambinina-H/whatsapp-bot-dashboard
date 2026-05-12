import { useQuery } from '@tanstack/react-query'
import { mockConversationsPayload } from '@/lib/mock-data'
import type { Conversation, ConversationsPayload } from '@/types/conversation'

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true'
const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL

async function fetchConversations(): Promise<ConversationsPayload> {
  if (USE_MOCKS) {
    return mockConversationsPayload
  }

  if (!WEBHOOK_URL) {
    throw new Error('VITE_N8N_WEBHOOK_URL est manquant dans .env.local')
  }

  const response = await fetch(WEBHOOK_URL)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`)
  }
  return (await response.json()) as ConversationsPayload
}

export function useConversations() {
  return useQuery<ConversationsPayload, Error, Conversation[]>({
    queryKey: ['conversations'],
    queryFn: fetchConversations,
    refetchInterval: 3000,
    select: (data) => data.conversations,
  })
}
