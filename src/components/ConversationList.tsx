import { useMemo, useState } from 'react'
import { differenceInDays, format, isToday, isYesterday } from 'date-fns'
import { fr } from 'date-fns/locale'
import { X } from 'lucide-react'
import { Avatar } from '@/components/Avatar'
import { ChannelGlyph } from '@/components/ChannelGlyph'
import {
  ChannelFilterMenu,
  type ChannelFilterValue,
} from '@/components/ChannelFilterMenu'
import { ConversationListSkeleton } from '@/components/ConversationListSkeleton'
import { EmptySearchState } from '@/components/EmptySearchState'
import { SearchBar } from '@/components/SearchBar'
import { useDebounce } from '@/hooks/useDebounce'
import { CHANNELS } from '@/lib/channels'
import { highlightMatch } from '@/lib/highlight'
import { cn } from '@/lib/utils'
import type { Channel, Conversation } from '@/types/conversation'

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
  const [channelFilter, setChannelFilter] = useState<ChannelFilterValue>('all')
  const debouncedQuery = useDebounce(searchQuery, 250)

  const channelCounts = useMemo(() => {
    const counts: Record<Channel, number> = {
      whatsapp: 0,
      facebook: 0,
      instagram: 0,
      linkedin: 0,
      unknown: 0,
    }
    for (const c of conversations) counts[c.channel] += 1
    return counts
  }, [conversations])

  const availableChannels = useMemo(
    () =>
      (Object.keys(channelCounts) as Channel[]).filter(
        (c) => channelCounts[c] > 0,
      ),
    [channelCounts],
  )

  const showChannelFilter = availableChannels.length > 1

  const filteredConversations = useMemo(() => {
    const query = debouncedQuery.trim()
    const normalizedQuery = normalize(query)
    const queryDigits = query.replace(/\D/g, '')

    return conversations.filter((conv) => {
      if (channelFilter !== 'all' && conv.channel !== channelFilter) {
        return false
      }
      if (!query) return true

      const name = normalize(conv.contact.name)
      const phone = conv.contact.phone.replace(/\D/g, '')
      return (
        name.includes(normalizedQuery) ||
        (queryDigits.length > 0 && phone.includes(queryDigits))
      )
    })
  }, [conversations, debouncedQuery, channelFilter])

  const sorted = sortConversations(filteredConversations)
  const activeQuery = debouncedQuery.trim()
  const hasActiveFilter = channelFilter !== 'all' || activeQuery.length > 0

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
            : hasActiveFilter
              ? `${filteredConversations.length} sur ${conversations.length}`
              : `${conversations.length} contact(s)`}
        </span>
      </header>

      {!isLoading && conversations.length > 0 && (
        <div className="flex shrink-0 flex-col gap-2 border-b border-slate-100 px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onClear={() => setSearchQuery('')}
              />
            </div>
            {showChannelFilter && (
              <ChannelFilterMenu
                available={availableChannels}
                active={channelFilter}
                onChange={setChannelFilter}
                counts={channelCounts}
                totalCount={conversations.length}
              />
            )}
          </div>
          {channelFilter !== 'all' && (
            <button
              type="button"
              onClick={() => setChannelFilter('all')}
              aria-label={`Retirer le filtre ${CHANNELS[channelFilter].label}`}
              className="group inline-flex w-fit items-center gap-1.5 rounded-full bg-slate-100 py-0.5 pl-2 pr-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200"
            >
              <span style={{ color: CHANNELS[channelFilter].color }}>
                <ChannelGlyph channel={channelFilter} size={11} decorative />
              </span>
              <span>{CHANNELS[channelFilter].label}</span>
              <X
                className="size-3 text-slate-400 group-hover:text-slate-600"
                aria-hidden="true"
              />
            </button>
          )}
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
            query={
              activeQuery ||
              (channelFilter !== 'all' ? CHANNELS[channelFilter].label : '')
            }
            onClear={() => {
              setSearchQuery('')
              setChannelFilter('all')
            }}
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
                  <Avatar
                    name={conv.contact.name}
                    src={conv.contact.avatar}
                    channel={conv.channel}
                  />
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
