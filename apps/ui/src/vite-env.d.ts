/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PEERJS_SERVER_HOST: string
  readonly VITE_PEERJS_SERVER_PORT: string
  readonly VITE_PEERJS_SERVER_PATH: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
