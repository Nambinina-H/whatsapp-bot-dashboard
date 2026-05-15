import { useEffect, useRef, useState } from 'react'
import { Check, ListFilter } from 'lucide-react'
import { ChannelGlyph } from '@/components/ChannelGlyph'
import { CHANNELS, CHANNEL_ORDER } from '@/lib/channels'
import { cn } from '@/lib/utils'
import type { Channel } from '@/types/conversation'

export type ChannelFilterValue = Channel | 'all'
export type CampaignFilterValue = string | 'all'

interface FilterMenuProps {
  availableChannels: Channel[]
  channelFilter: ChannelFilterValue
  onChannelChange: (value: ChannelFilterValue) => void
  channelCounts: Record<Channel, number>
  totalCount: number

  availableCampaigns: string[]
  campaignFilter: CampaignFilterValue
  onCampaignChange: (value: CampaignFilterValue) => void
  campaignCounts: Record<string, number>
  campaignTotalCount: number
}

export function FilterMenu({
  availableChannels,
  channelFilter,
  onChannelChange,
  channelCounts,
  totalCount,
  availableCampaigns,
  campaignFilter,
  onCampaignChange,
  campaignCounts,
  campaignTotalCount,
}: FilterMenuProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const isFiltered = channelFilter !== 'all' || campaignFilter !== 'all'

  useEffect(() => {
    if (!open) return
    const handleDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleDown)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleDown)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  const presentChannels = CHANNEL_ORDER.filter((c) =>
    availableChannels.includes(c),
  )
  const activeChannelColor =
    channelFilter !== 'all' ? CHANNELS[channelFilter as Channel].color : null

  const pickChannel = (v: ChannelFilterValue) => {
    onChannelChange(v)
    setOpen(false)
  }
  const pickCampaign = (v: CampaignFilterValue) => {
    onCampaignChange(v)
    setOpen(false)
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={isFiltered ? 'Filtres actifs. Modifier' : 'Filtrer'}
        className={cn(
          'relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border transition-colors md:h-9 md:w-9',
          isFiltered
            ? 'border-slate-300 bg-slate-50 text-slate-700'
            : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50',
        )}
      >
        <ListFilter className="size-4" aria-hidden="true" />
        {isFiltered && (
          <span
            className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white"
            style={{
              backgroundColor: activeChannelColor ?? '#475569',
            }}
            aria-hidden="true"
          />
        )}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Filtres"
          className="absolute right-0 top-full z-20 mt-1 max-h-[calc(100dvh-120px)] w-64 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg"
        >
          <SectionLabel>Canal</SectionLabel>
          <MenuOption
            label="Tous"
            count={totalCount}
            selected={channelFilter === 'all'}
            onClick={() => pickChannel('all')}
          />
          {presentChannels.map((ch) => (
            <MenuOption
              key={ch}
              label={CHANNELS[ch].label}
              count={channelCounts[ch]}
              selected={channelFilter === ch}
              onClick={() => pickChannel(ch)}
              icon={
                <span style={{ color: CHANNELS[ch].color }}>
                  <ChannelGlyph channel={ch} size={14} decorative />
                </span>
              }
            />
          ))}

          {availableCampaigns.length > 0 && (
            <>
              <div className="my-1 border-t border-slate-100" />
              <SectionLabel>Campagne</SectionLabel>
              <MenuOption
                label="Toutes"
                count={campaignTotalCount}
                selected={campaignFilter === 'all'}
                onClick={() => pickCampaign('all')}
              />
              {availableCampaigns.map((name) => (
                <MenuOption
                  key={name}
                  label={name}
                  count={campaignCounts[name] ?? 0}
                  selected={campaignFilter === name}
                  onClick={() => pickCampaign(name)}
                />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
      {children}
    </div>
  )
}

interface MenuOptionProps {
  label: string
  count: number
  selected: boolean
  onClick: () => void
  icon?: React.ReactNode
}

function MenuOption({ label, count, selected, onClick, icon }: MenuOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="menuitemradio"
      aria-checked={selected}
      className={cn(
        'flex w-full items-center gap-2 rounded-md px-2 py-3 text-left text-sm transition-colors md:py-1.5',
        selected
          ? 'bg-slate-100 text-slate-900'
          : 'text-slate-700 hover:bg-slate-50',
      )}
    >
      <span className="flex h-4 w-4 shrink-0 items-center justify-center">
        {icon ?? <span className="block h-1.5 w-1.5 rounded-full bg-slate-400" />}
      </span>
      <span className="flex-1 truncate">{label}</span>
      <span className="shrink-0 text-xs text-slate-400">{count}</span>
      {selected ? (
        <Check className="size-3.5 shrink-0 text-slate-600" aria-hidden="true" />
      ) : (
        <span className="size-3.5 shrink-0" aria-hidden="true" />
      )}
    </button>
  )
}
