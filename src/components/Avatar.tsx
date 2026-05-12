import { cn, initials } from '@/lib/utils'

interface AvatarProps {
  name: string
  src?: string | null
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

export function Avatar({ name, src, className }: AvatarProps) {
  return (
    <div
      className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-medium text-white',
        !src && colorFromName(name),
        className,
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
  )
}
