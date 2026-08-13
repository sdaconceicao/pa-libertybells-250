import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths({ projects: ['./tsconfig.json'] })],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    // Polyfills for DOM APIs jsdom omits that react-aria (via @code-x/lago)
    // depends on when opening overlays and running focus/animation logic.
    setupFiles: ['./src/test/setup.ts'],
    // Placeholder so modules that transitively import the DB client (via server
    // functions) don't throw at import time. The Neon client connects lazily,
    // so no real connection is made during unit tests.
    env: {
      DATABASE_URL: 'postgres://test:test@localhost:5432/test',
    },
  },
})
