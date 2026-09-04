/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Origin of the Kognisie Worker, e.g. http://localhost:8787.
   * Leave unset to run local-only with no user-state sync.
   */
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
