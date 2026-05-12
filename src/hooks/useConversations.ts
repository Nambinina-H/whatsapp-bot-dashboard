import { useQuery } from '@tanstack/react-query'
import { mockConversationsPayload } from '@/lib/mock-data'
import type { Conversation, ConversationsPayload } from '@/types/conversation'

async function fetchConversations(): Promise<ConversationsPayload> {
  return mockConversationsPayload
}

export function useConversations() {
  return useQuery<ConversationsPayload, Error, Conversation[]>({
    queryKey: ['conversations'],
    queryFn: fetchConversations,
    refetchInterval: 3000,
    select: (data) => data.conversations,
  })
}
