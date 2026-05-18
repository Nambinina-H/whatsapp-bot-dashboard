import { CHANNELS } from '@/lib/channels'
import { cn } from '@/lib/utils'
import type { Channel } from '@/types/conversation'

interface ChannelGlyphProps {
  channel: Channel
  size?: number
  className?: string
  decorative?: boolean
}

export function ChannelGlyph({
  channel,
  size = 16,
  className,
  decorative = false,
}: ChannelGlyphProps) {
  const cfg = CHANNELS[channel]
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={cn(className)}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : cfg.label}
      aria-hidden={decorative ? true : undefined}
    >
      {!decorative && <title>{cfg.label}</title>}
      <path d={cfg.path} fill="currentColor" />
    </svg>
  )
}
