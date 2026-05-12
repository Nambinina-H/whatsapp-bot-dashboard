import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export function initials(name: string): string {
  const trimmed = name.trim()
  const countryMatch = trimmed.match(/^([A-Z]{2,3})\s\+/)
  if (countryMatch) return countryMatch[1]

  const words = trimmed.split(/\s+/).filter((w) => /[a-zA-Z0-9]/.test(w))
  if (words.length === 0) return '?'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  const first = words[0].match(/[a-zA-Z0-9]/)?.[0] ?? ''
  const last = words[words.length - 1].match(/[a-zA-Z0-9]/)?.[0] ?? ''
  return (first + last).toUpperCase()
}
