import { ChannelBadge } from '@/components/ChannelBadge'
import { cn, initials } from '@/lib/utils'
import type { Channel } from '@/types/conversation'

interface AvatarProps {
  name: string
  src?: string | null
  channel?: Channel
  className?: string
}

function colorFromName(name: string): string {
  const palette = [
    'bg-emerald-500',
    'bg-sky-500',
    'bg-violet-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-teal-500',
    'bg-indigo-500',
    'bg-fuchsia-500',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  }
  return palette[hash % palette.length]
}

export function Avatar({ name, src, channel, className }: AvatarProps) {
  return (
    <div className={cn('relative shrink-0', className)}>
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium text-white',
          !src && colorFromName(name),
        )}
      >
        {src ? (
          <img
            src={src}
            alt={name}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <span>{initials(name)}</span>
        )}
      </div>
      {channel && (
        <ChannelBadge
          channel={channel}
          className="absolute -bottom-0.5 -right-0.5"
        />
      )}
    </div>
  )
}
