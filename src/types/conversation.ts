export type MessageSender = 'bot' | 'user'

export type Channel =
  | 'whatsapp'
  | 'facebook'
  | 'instagram'
  | 'linkedin'
  | 'unknown'

export interface Message {
  id: string
  from: MessageSender
  text: string
  timestamp: string
}

export interface Contact {
  name: string
  phone: string
  avatar?: string | null
}

export interface LeadMeta {
  campaignName?: string
}

export interface Conversation {
  id: string
  contact: Contact
  messages: Message[]
  unreadCount: number
  channel: Channel
  lead?: LeadMeta
}

export interface ConversationsPayload {
  conversations: Conversation[]
}
