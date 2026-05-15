import { useMemo, useState } from 'react'
import { differenceInDays, format, isToday, isYesterday } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Avatar } from '@/components/Avatar'
import { ConversationListSkeleton } from '@/components/ConversationListSkeleton'
import { EmptySearchState } from '@/components/EmptySearchState'
import { SearchBar } from '@/components/SearchBar'
import { useDebounce } from '@/hooks/useDebounce'
import { highlightMatch } from '@/lib/highlight'
import { cn } from '@/lib/utils'
import type { Conversation } from '@/types/conversation'

interface ConversationListProps {
  conversations: Conversation[]
  selectedId: string | null
  onSelect: (id: string) => void
  isLoading?: boolean
  isFetching?: boolean
}

function lastMessageOf(conv: Conversation) {
  return conv.messages[conv.messages.length - 1]
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  if (isToday(date)) return format(date, 'HH:mm')
  if (isYesterday(date)) return 'hier'
  if (differenceInDays(new Date(), date) < 7) {
    return format(date, 'EEE', { locale: fr }).replace('.', '')
  }
  return format(date, 'dd/MM/yyyy')
}

function sortConversations(list: Conversation[]): Conversation[] {
  return [...list].sort((a, b) => {
    const aLast = lastMessageOf(a)?.timestamp ?? ''
    const bLast = lastMessageOf(b)?.timestamp ?? ''
    return bLast.localeCompare(aLast)
  })
}

function previewOf(conv: Conversation): string {
  const last = lastMessageOf(conv)
  if (!last) return 'Aucun message'
  const prefix = last.from === 'bot' ? 'Bot · ' : ''
  const firstLine = last.text.split('\n')[0]
  return `${prefix}${firstLine}`
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  isLoading,
  isFetching,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedQuery = useDebounce(searchQuery, 250)

  const filteredConversations = useMemo(() => {
    const query = debouncedQuery.trim()
    if (!query) return conversations

    const normalizedQuery = normalize(query)
    const queryDigits = query.replace(/\D/g, '')

    return conversations.filter((conv) => {
      const name = normalize(conv.contact.name)
      const phone = conv.contact.phone.replace(/\D/g, '')

      return (
        name.includes(normalizedQuery) ||
        (queryDigits.length > 0 && phone.includes(queryDigits))
      )
    })
  }, [conversations, debouncedQuery])

  const sorted = sortConversations(filteredConversations)
  const activeQuery = debouncedQuery.trim()

  return (
    <div className="flex h-full flex-col bg-white">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-4">
        <div className="flex items-center gap-2">
          <h1 className="text-base font-semibold text-slate-900">Conversations</h1>
          {isFetching && !isLoading && (
            <span
              className="relative inline-flex h-2 w-2"
              title="Synchronisation…"
              aria-label="Synchronisation en cours"
            >
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
          )}
        </div>
        <span className="text-xs text-slate-500">
          {isLoading
            ? 'Chargement…'
            : activeQuery
              ? `${filteredConversations.length} sur ${conversations.length}`
              : `${conversations.length} contact(s)`}
        </span>
      </header>

      {!isLoading && conversations.length > 0 && (
        <div className="shrink-0 border-b border-slate-100 px-3 py-2">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => setSearchQuery('')}
          />
        </div>
      )}

      {isLoading ? (
        <div className="flex-1 overflow-hidden">
          <ConversationListSkeleton />
        </div>
      ) : conversations.length === 0 ? (
        <div className="flex-1 overflow-hidden">
          <p className="px-4 py-8 text-center text-sm text-slate-500">
            Aucune conversation pour l'instant.
          </p>
        </div>
      ) : filteredConversations.length === 0 ? (
        <div className="flex-1 overflow-hidden">
          <EmptySearchState
            query={activeQuery}
            onClear={() => setSearchQuery('')}
          />
        </div>
      ) : (
        <ul className="flex-1 overflow-y-auto">
          {sorted.map((conv) => {
            const last = lastMessageOf(conv)
            const isSelected = conv.id === selectedId
            return (
              <li key={conv.id}>
                <button
                  type="button"
                  onClick={() => onSelect(conv.id)}
                  className={cn(
                    'flex w-full items-center gap-3 border-b border-slate-100 px-3 py-3 text-left transition-colors last:border-b-0 hover:bg-slate-50',
                    isSelected && 'bg-slate-100 hover:bg-slate-100',
                  )}
                >
                  <Avatar name={conv.contact.name} src={conv.contact.avatar} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium text-slate-900">
                        {highlightMatch(conv.contact.name, activeQuery)}
                      </span>
                      {last && (
                        <span className="shrink-0 text-xs text-slate-400">
                          {formatTimestamp(last.timestamp)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs text-slate-500">
                        {previewOf(conv)}
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
      )}
    </div>
  )
}
