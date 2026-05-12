import { formatDistanceToNowStrict, isToday, format } from 'date-fns'
import { Avatar } from '@/components/Avatar'
import { cn } from '@/lib/utils'
import type { Conversation } from '@/types/conversation'

interface ConversationListProps {
  conversations: Conversation[]
  selectedId: string | null
  onSelect: (id: string) => void
  isLoading?: boolean
}

function lastMessageOf(conv: Conversation) {
  return conv.messages[conv.messages.length - 1]
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  if (isToday(date)) return format(date, 'HH:mm')
  return formatDistanceToNowStrict(date, { addSuffix: false })
}

function sortConversations(list: Conversation[]): Conversation[] {
  return [...list].sort((a, b) => {
    const aLast = lastMessageOf(a)?.timestamp ?? ''
    const bLast = lastMessageOf(b)?.timestamp ?? ''
    return bLast.localeCompare(aLast)
  })
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  isLoading,
}: ConversationListProps) {
  const sorted = sortConversations(conversations)

  return (
    <div className="flex h-full flex-col bg-background">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <h1 className="text-base font-semibold">Conversations</h1>
        <span className="text-xs text-muted-foreground">
          {isLoading ? 'Chargement…' : `${conversations.length} contact(s)`}
        </span>
      </header>

      <ul className="flex-1 overflow-y-auto">
        {sorted.length === 0 && !isLoading && (
          <li className="px-4 py-8 text-center text-sm text-muted-foreground">
            Aucune conversation pour l'instant.
          </li>
        )}
        {sorted.map((conv) => {
          const last = lastMessageOf(conv)
          const isSelected = conv.id === selectedId
          return (
            <li key={conv.id}>
              <button
                type="button"
                onClick={() => onSelect(conv.id)}
                className={cn(
                  'flex w-full items-center gap-3 border-b px-4 py-3 text-left transition-colors hover:bg-accent',
                  isSelected && 'bg-accent',
                )}
              >
                <Avatar name={conv.contact.name} src={conv.contact.avatar} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">
                      {conv.contact.name}
                    </span>
                    {last && (
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatTimestamp(last.timestamp)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm text-muted-foreground">
                      {last
                        ? `${last.from === 'bot' ? 'Bot · ' : ''}${last.text}`
                        : 'Aucun message'}
                    </span>
                    {conv.unreadCount > 0 && (
                      <span className="ml-2 inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
