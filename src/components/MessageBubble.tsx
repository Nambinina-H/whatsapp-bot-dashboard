import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { renderTextWithLinks } from '@/lib/text'
import type { Message } from '@/types/conversation'

interface MessageBubbleProps {
  message: Message
  isGrouped?: boolean
}

export function MessageBubble({ message, isGrouped }: MessageBubbleProps) {
  const isBot = message.from === 'bot'
  const time = (() => {
    const d = new Date(message.timestamp)
    return Number.isNaN(d.getTime()) ? '' : format(d, 'HH:mm')
  })()

  return (
    <div
      className={cn(
        'flex w-full first:mt-0',
        isGrouped ? 'mt-1' : 'mt-3',
        isBot ? 'justify-start' : 'justify-end',
      )}
    >
      <div
        className={cn(
          'max-w-[640px] rounded-2xl px-3 py-2 text-sm text-slate-900 shadow-sm',
          isBot
            ? 'rounded-bl-sm border border-slate-200 bg-white'
            : 'rounded-br-sm bg-[#d9fdd3]',
        )}
      >
        <p className="whitespace-pre-wrap break-words">
          {renderTextWithLinks(message.text, { italics: isBot })}
          <span
            className="float-right ml-2 mt-1 select-none text-[10px] leading-none text-slate-500"
            aria-label={`envoyé à ${time}`}
          >
            {time}
          </span>
        </p>
      </div>
    </div>
  )
}
