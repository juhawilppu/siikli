import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node', // or 'happy-dom' / 'jsdom' for frontend
    include: ['**/*.{test,spec}.{ts,tsx}'],
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      include: ['src/**/*.ts', 'frontend/**/*.ts', 'frontend/src/**/*.tsx'],
      exclude: [
        'src/dev/**',
        'src/types/**',
        'src/test/**',
        'frontend/src/components/ui/**',
        '**/*.config.*',
      ],
      reporter: ['text', 'html'],
    },
  },
})
