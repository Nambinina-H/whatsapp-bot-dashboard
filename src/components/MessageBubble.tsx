import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import type { Message } from '@/types/conversation'

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isBot = message.from === 'bot'
  const time = (() => {
    const d = new Date(message.timestamp)
    return Number.isNaN(d.getTime()) ? '' : format(d, 'HH:mm')
  })()

  return (
    <div className={cn('flex w-full', isBot ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[80%] rounded-lg px-3 py-2 text-sm shadow-sm md:max-w-[65%]',
          isBot
            ? 'rounded-br-sm bg-bubble-out text-foreground'
            : 'rounded-bl-sm bg-bubble-in text-foreground',
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.text}</p>
        <div className="mt-1 text-right text-[10px] text-muted-foreground">
          {time}
        </div>
      </div>
    </div>
  )
}
