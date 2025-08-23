import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.{test,spec}.{ts,tsx}'],
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: [
        'src/dev/**',
        'src/types/**',
        'src/test/**',
        '**/*.config.*',
      ],
      reporter: ['text', 'html', 'lcov'],
    },
    testTimeout: 10000,
  },
})
