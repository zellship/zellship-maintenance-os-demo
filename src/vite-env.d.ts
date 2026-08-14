/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEMO_SCENARIO?: string;
  readonly VITE_DEMO_DATE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
