export type MessageSender = 'bot' | 'user'

export interface Message {
  id: string
  from: MessageSender
  text: string
  timestamp: string
}

export interface Contact {
  name: string
  phone: string
  avatar?: string
}

export interface Conversation {
  id: string
  contact: Contact
  messages: Message[]
  unreadCount: number
}

export interface ConversationsPayload {
  conversations: Conversation[]
}
