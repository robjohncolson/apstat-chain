// apps/ui/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills' // <-- IMPORT THE PLUGIN
import path from 'path' // <-- IMPORT NODE'S PATH MODULE

// https://vite.dev/config/
export default defineConfig({
  // We've added the new plugin here:
  plugins: [
    react(),
    nodePolyfills() // <-- USE THE PLUGIN
  ],

  // We no longer need the manual define and resolve.alias sections.
  // The plugin handles it all automatically.
  // ADD THIS ENTIRE "resolve" SECTION
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // Server configuration for development
  server: {
    fs: {
      // Allow serving files from outside the project root (for monorepo)
      allow: ['../..'],
    },
  },

  cacheDir: '../../node_modules/.vite/apps/ui',
  
  // @ts-ignore - vitest config
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})