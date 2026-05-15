import { useEffect, useRef, useState } from 'react'
import { Check, ListFilter } from 'lucide-react'
import { ChannelGlyph } from '@/components/ChannelGlyph'
import { CHANNELS, CHANNEL_ORDER } from '@/lib/channels'
import { cn } from '@/lib/utils'
import type { Channel } from '@/types/conversation'

export type ChannelFilterValue = Channel | 'all'

interface ChannelFilterMenuProps {
  available: Channel[]
  active: ChannelFilterValue
  onChange: (value: ChannelFilterValue) => void
  counts: Record<Channel, number>
  totalCount: number
}

export function ChannelFilterMenu({
  available,
  active,
  onChange,
  counts,
  totalCount,
}: ChannelFilterMenuProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const isFiltered = active !== 'all'

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

  const presentChannels = CHANNEL_ORDER.filter((c) => available.includes(c))
  const activeChannel = isFiltered ? (active as Channel) : null
  const activeLabel = activeChannel ? CHANNELS[activeChannel].label : null

  const handleSelect = (value: ChannelFilterValue) => {
    onChange(value)
    setOpen(false)
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={
          activeLabel
            ? `Filtre actif : ${activeLabel}. Modifier`
            : 'Filtrer par canal'
        }
        className={cn(
          'relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border transition-colors md:h-9 md:w-9',
          isFiltered
            ? 'border-slate-300 bg-slate-50 text-slate-700'
            : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50',
        )}
      >
        <ListFilter className="size-4" aria-hidden="true" />
        {activeChannel && (
          <span
            className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white"
            style={{ backgroundColor: CHANNELS[activeChannel].color }}
            aria-hidden="true"
          />
        )}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Filtrer par canal"
          className="absolute right-0 top-full z-20 mt-1 w-56 rounded-lg border border-slate-200 bg-white p-1 shadow-lg"
        >
          <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Canal
          </div>
          <MenuOption
            label="Tous"
            count={totalCount}
            selected={active === 'all'}
            onClick={() => handleSelect('all')}
          />
          {presentChannels.map((ch) => (
            <MenuOption
              key={ch}
              label={CHANNELS[ch].label}
              count={counts[ch]}
              selected={active === ch}
              onClick={() => handleSelect(ch)}
              icon={
                <span style={{ color: CHANNELS[ch].color }}>
                  <ChannelGlyph channel={ch} size={14} decorative />
                </span>
              }
            />
          ))}
        </div>
      )}
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
