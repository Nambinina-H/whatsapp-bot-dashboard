import { useQuery } from '@tanstack/react-query'
import { normalizeChannel } from '@/lib/channels'
import { mockConversationsPayload } from '@/lib/mock-data'
import type { Conversation, ConversationsPayload } from '@/types/conversation'

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true'
const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL
const API_KEY = import.meta.env.VITE_API_KEY

async function fetchConversations(): Promise<ConversationsPayload> {
  if (USE_MOCKS) {
    return mockConversationsPayload
  }

  if (!WEBHOOK_URL) {
    throw new Error('VITE_N8N_WEBHOOK_URL est manquant dans .env.local')
  }

  const response = await fetch(WEBHOOK_URL, {
    headers: {
      'x-api-key': API_KEY,
      'Content-Type': 'application/json',
    },
  })

  if (response.status === 401) {
    throw new Error('Clé API invalide ou manquante. Vérifie VITE_API_KEY.')
  }
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  const raw = await response.text()
  if (!raw.trim()) {
    throw new Error('Synchronisation indisponible')
  }
  return JSON.parse(raw) as ConversationsPayload
}

export function useConversations() {
  return useQuery<ConversationsPayload, Error, Conversation[]>({
    queryKey: ['conversations'],
    queryFn: fetchConversations,
    refetchInterval: 3000,
    refetchIntervalInBackground: false,
    select: (data) =>
      data.conversations.map((c) => ({
        ...c,
        channel: normalizeChannel((c as { channel?: unknown }).channel),
      })),
  })
}
