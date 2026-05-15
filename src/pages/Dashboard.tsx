import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { ConversationList } from '@/components/ConversationList'
import { ConversationView } from '@/components/ConversationView'
import { useConversations } from '@/hooks/useConversations'
import { cn } from '@/lib/utils'

export function Dashboard() {
  const {
    data: conversations,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useConversations()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const list = conversations ?? []
  const selected = list.find((c) => c.id === selectedId) ?? null

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-slate-50">
      {isError && (
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          <span className="min-w-0 truncate">
            Erreur de chargement : {error?.message ?? 'inconnue'}
          </span>
          <button
            type="button"
            onClick={() => refetch()}
            className="shrink-0 rounded-md border border-destructive/40 px-3 py-1 text-xs font-medium hover:bg-destructive/20"
          >
            Réessayer
          </button>
        </div>
      )}

      <div className="flex min-h-0 w-full flex-1 overflow-hidden">
        <aside
          className={cn(
            'h-full w-full border-r border-slate-200 bg-white md:w-[380px] md:shrink-0',
            selected ? 'hidden md:flex' : 'flex',
            'flex-col',
          )}
        >
          <ConversationList
            conversations={list}
            selectedId={selectedId}
            onSelect={setSelectedId}
            isLoading={isLoading}
            isFetching={isFetching}
          />
        </aside>

        <main
          className={cn(
            'h-full min-w-0 flex-1 bg-[#efeae2]',
            selected ? 'flex' : 'hidden md:flex',
            'flex-col',
          )}
        >
          {selected ? (
            <ConversationView
              conversation={selected}
              onBack={() => setSelectedId(null)}
            />
          ) : (
            <div className="flex h-full items-center justify-center p-8 text-center">
              <div className="max-w-sm">
                <MessageCircle
                  className="mx-auto mb-4 size-16 text-slate-300"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <h2 className="text-lg font-medium text-slate-600">
                  Sélectionnez une conversation
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Choisissez un prospect à gauche pour voir ses échanges avec le bot.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
