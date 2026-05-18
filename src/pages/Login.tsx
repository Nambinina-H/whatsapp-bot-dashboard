import { type FormEvent, useState } from 'react'
import { Loader2, Lock, MessageCircle, User } from 'lucide-react'

const ADMIN_USER = 'Admin'
const ADMIN_PASS = 'Admin'

interface LoginProps {
  onSuccess: () => void
}

export function Login({ onSuccess }: LoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      onSuccess()
      return
    }
    setIsSubmitting(false)
    setError('Identifiants invalides')
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
              <MessageCircle className="size-6" strokeWidth={1.75} aria-hidden="true" />
            </div>
            <h1 className="text-xl font-semibold text-slate-900">
              WhatsApp Bot Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Connecte-toi pour accéder aux conversations
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-slate-700"
              >
                Nom d'utilisateur
              </label>
              <div className="relative mt-1">
                <User
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(event) => {
                    setUsername(event.target.value)
                    setError(null)
                  }}
                  className="block h-11 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/30"
                  placeholder="Admin"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700"
              >
                Mot de passe
              </label>
              <div className="relative mt-1">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value)
                    setError(null)
                  }}
                  className="block h-11 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/30"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <p role="alert" className="text-sm font-medium text-destructive">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-70"
            >
              {isSubmitting && (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              )}
              Se connecter
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
