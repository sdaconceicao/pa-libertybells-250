import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths({ projects: ['./tsconfig.json'] })],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    // Placeholder so modules that transitively import the DB client (via server
    // functions) don't throw at import time. The Neon client connects lazily,
    // so no real connection is made during unit tests.
    env: {
      DATABASE_URL: 'postgres://test:test@localhost:5432/test',
    },
  },
})
