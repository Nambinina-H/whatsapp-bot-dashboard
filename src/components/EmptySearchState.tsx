import { SearchX } from 'lucide-react'

interface EmptySearchStateProps {
  query: string
  onClear: () => void
}

export function EmptySearchState({ query, onClear }: EmptySearchStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
      <SearchX
        className="mb-3 size-12 text-slate-300"
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <p className="text-sm font-medium text-slate-700">
        Aucun prospect pour «&nbsp;{query}&nbsp;»
      </p>
      <p className="mt-1 text-xs text-slate-500">
        Essaye avec un autre numéro ou nom
      </p>
      <button
        type="button"
        onClick={onClear}
        className="mt-4 rounded-md border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
      >
        Effacer
      </button>
    </div>
  )
}
