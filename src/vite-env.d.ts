/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_N8N_WEBHOOK_URL: string
  readonly VITE_USE_MOCKS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
