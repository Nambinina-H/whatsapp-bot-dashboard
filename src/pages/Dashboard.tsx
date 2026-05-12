import { useState } from 'react'
import { ConversationList } from '@/components/ConversationList'
import { ConversationView } from '@/components/ConversationView'
import { useConversations } from '@/hooks/useConversations'
import { cn } from '@/lib/utils'

export function Dashboard() {
  const { data: conversations, isLoading, isError, error } = useConversations()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const list = conversations ?? []
  const selected = list.find((c) => c.id === selectedId) ?? null

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center text-sm text-destructive">
        Erreur de chargement : {error?.message ?? 'inconnue'}
      </div>
    )
  }

  return (
    <div className="flex h-full w-full overflow-hidden">
      <aside
        className={cn(
          'h-full w-full border-r md:w-[360px] md:shrink-0',
          selected ? 'hidden md:block' : 'block',
        )}
      >
        <ConversationList
          conversations={list}
          selectedId={selectedId}
          onSelect={setSelectedId}
          isLoading={isLoading}
        />
      </aside>

      <main
        className={cn(
          'h-full flex-1',
          selected ? 'block' : 'hidden md:block',
        )}
      >
        {selected ? (
          <ConversationView
            conversation={selected}
            onBack={() => setSelectedId(null)}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-chat-pane p-8 text-center">
            <div className="max-w-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold">
                Sélectionnez une conversation
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Choisissez un contact dans la liste pour afficher l'historique
                des messages échangés avec le bot.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
