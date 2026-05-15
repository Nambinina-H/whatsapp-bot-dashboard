import { ChevronLeft } from 'lucide-react'
import { Avatar } from '@/components/Avatar'
import { ChannelGlyph } from '@/components/ChannelGlyph'
import { MessageBubble } from '@/components/MessageBubble'
import { CHANNELS } from '@/lib/channels'
import type { Conversation } from '@/types/conversation'

interface ConversationViewProps {
  conversation: Conversation
  onBack?: () => void
}

export function ConversationView({ conversation, onBack }: ConversationViewProps) {
  const sorted = [...conversation.messages].sort((a, b) =>
    a.timestamp.localeCompare(b.timestamp),
  )
  const channelCfg = CHANNELS[conversation.channel]

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-6 shadow-sm">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="-ml-2 inline-flex h-11 w-11 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 md:hidden"
            aria-label="Retour à la liste"
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
        )}
        <Avatar
          name={conversation.contact.name}
          src={conversation.contact.avatar}
          channel={conversation.channel}
        />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-slate-900">
            {conversation.contact.name}
          </div>
          <div className="flex items-center gap-1.5 truncate text-xs text-slate-500">
            <span className="truncate">{conversation.contact.phone}</span>
            <span aria-hidden="true">·</span>
            <span
              className="inline-flex shrink-0 items-center gap-1"
              style={{ color: channelCfg.color }}
              aria-label={`Canal : ${channelCfg.label}`}
              title={channelCfg.label}
            >
              <ChannelGlyph
                channel={conversation.channel}
                size={12}
                decorative
              />
              <span className="hidden font-medium sm:inline">
                {channelCfg.label}
              </span>
            </span>
          </div>
        </div>
        <span className="shrink-0 text-xs text-slate-500">
          {conversation.messages.length} message
          {conversation.messages.length > 1 ? 's' : ''}
        </span>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-4 lg:px-8 xl:px-12">
        <div className="flex flex-col">
          {sorted.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-500">
              Aucun message dans cette conversation.
            </p>
          ) : (
            sorted.map((m, i) => {
              const prev = i > 0 ? sorted[i - 1] : null
              const isGrouped = prev !== null && prev.from === m.from
              return (
                <MessageBubble key={m.id} message={m} isGrouped={isGrouped} />
              )
            })
          )}
        </div>
      </div>

      <footer className="shrink-0 border-t border-slate-200 bg-white px-6 py-2 text-center text-xs text-slate-500">
        Lecture seule · les réponses sont gérées par n8n
      </footer>
    </div>
  )
}
