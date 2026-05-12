import { Skeleton } from '@/components/ui/skeleton'

const ROWS = 5

export function ConversationListSkeleton() {
  return (
    <ul>
      {Array.from({ length: ROWS }).map((_, i) => (
        <li
          key={i}
          className="flex items-center gap-3 border-b px-4 py-3 last:border-b-0"
        >
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-10" />
            </div>
            <Skeleton className="h-3 w-3/4" />
          </div>
        </li>
      ))}
    </ul>
  )
}
