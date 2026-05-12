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
        isBot ? 'justify-end' : 'justify-start',
      )}
    >
      <div
        className={cn(
          'max-w-[80%] rounded-lg px-3 py-1.5 text-sm shadow-sm md:max-w-[75%] lg:max-w-[65%]',
          isBot
            ? 'rounded-br-sm bg-bubble-out text-foreground'
            : 'rounded-bl-sm bg-bubble-in text-foreground',
        )}
      >
        <p className="whitespace-pre-wrap break-words">
          {renderTextWithLinks(message.text, { italics: isBot })}
          <span
            className="float-right ml-2 mt-1 select-none text-[10px] leading-none text-muted-foreground"
            aria-label={`envoyé à ${time}`}
          >
            {time}
          </span>
        </p>
      </div>
    </div>
  )
}
