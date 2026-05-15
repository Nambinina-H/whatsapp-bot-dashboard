import type { ReactNode } from 'react'

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}

export function highlightMatch(text: string, query: string): ReactNode {
  const trimmed = query.trim()
  if (!trimmed) return text

  const normalizedText = normalize(text)
  const normalizedQuery = normalize(trimmed)
  const matchIndex = normalizedText.indexOf(normalizedQuery)

  if (matchIndex === -1) return text

  const before = text.slice(0, matchIndex)
  const match = text.slice(matchIndex, matchIndex + trimmed.length)
  const after = text.slice(matchIndex + trimmed.length)

  return (
    <>
      {before}
      <mark className="rounded bg-yellow-200 px-0.5 font-medium">{match}</mark>
      {after}
    </>
  )
}
