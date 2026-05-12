import type { ReactNode } from 'react'

const TOKEN_RE = /(https?:\/\/[^\s]+)|\*([^*\n]+)\*/g

export interface RenderTextOptions {
  italics?: boolean
}

export function renderTextWithLinks(
  text: string,
  options: RenderTextOptions = {},
): ReactNode[] {
  const nodes: ReactNode[] = []
  let cursor = 0
  let key = 0

  for (const match of text.matchAll(TOKEN_RE)) {
    const start = match.index ?? 0
    if (start > cursor) {
      nodes.push(text.slice(cursor, start))
    }

    const [whole, url, italic] = match
    if (url) {
      nodes.push(
        <a
          key={`l-${key++}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-primary"
        >
          {url}
        </a>,
      )
    } else if (italic && options.italics) {
      nodes.push(<em key={`e-${key++}`}>{italic}</em>)
    } else {
      nodes.push(whole)
    }

    cursor = start + whole.length
  }

  if (cursor < text.length) {
    nodes.push(text.slice(cursor))
  }

  return nodes
}
