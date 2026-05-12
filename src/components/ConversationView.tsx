import { Avatar } from '@/components/Avatar'
import { MessageBubble } from '@/components/MessageBubble'
import type { Conversation } from '@/types/conversation'

interface ConversationViewProps {
  conversation: Conversation
  onBack?: () => void
}

export function ConversationView({ conversation, onBack }: ConversationViewProps) {
  const sorted = [...conversation.messages].sort((a, b) =>
    a.timestamp.localeCompare(b.timestamp),
  )

  return (
    <div className="flex h-full flex-col bg-chat-pane">
      <header className="flex items-center gap-3 border-b bg-background px-4 py-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="-ml-1 inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-accent md:hidden"
            aria-label="Retour à la liste"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        )}
        <Avatar
          name={conversation.contact.name}
          src={conversation.contact.avatar}
        />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">
            {conversation.contact.name}
          </div>
          <div className="truncate text-xs text-muted-foreground">
            {conversation.contact.phone}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto flex max-w-3xl flex-col gap-2">
          {sorted.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Aucun message dans cette conversation.
            </p>
          ) : (
            sorted.map((m) => <MessageBubble key={m.id} message={m} />)
          )}
        </div>
      </div>

      <footer className="border-t bg-background px-4 py-2 text-center text-xs text-muted-foreground">
        Lecture seule · les réponses sont gérées par n8n
      </footer>
    </div>
  )
}
