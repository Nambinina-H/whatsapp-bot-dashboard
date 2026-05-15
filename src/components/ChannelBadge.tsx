import { ChannelGlyph } from '@/components/ChannelGlyph'
import { CHANNELS } from '@/lib/channels'
import { cn } from '@/lib/utils'
import type { Channel } from '@/types/conversation'

interface ChannelBadgeProps {
  channel: Channel
  className?: string
}

export function ChannelBadge({ channel, className }: ChannelBadgeProps) {
  const cfg = CHANNELS[channel]
  return (
    <span
      className={cn(
        'inline-flex h-[18px] w-[18px] items-center justify-center rounded-full text-white ring-2 ring-white',
        className,
      )}
      style={{ backgroundColor: cfg.color }}
      title={cfg.label}
      aria-label={`Canal : ${cfg.label}`}
    >
      <ChannelGlyph channel={channel} size={11} decorative />
    </span>
  )
}
