import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        globals: true,
        environment: 'node', // or 'happy-dom' / 'jsdom' for frontend
        include: ['**/*.{test,spec}.{ts,tsx}'],
    },
})
