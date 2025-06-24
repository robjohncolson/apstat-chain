// apps/ui/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills' // <-- IMPORT THE PLUGIN

// https://vite.dev/config/
export default defineConfig({
  // We've added the new plugin here:
  plugins: [
    react(),
    nodePolyfills() // <-- USE THE PLUGIN
  ],

  // We no longer need the manual define and resolve.alias sections.
  // The plugin handles it all automatically.

  cacheDir: '../../node_modules/.vite/apps/ui',
  
  // @ts-ignore - vitest config
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})