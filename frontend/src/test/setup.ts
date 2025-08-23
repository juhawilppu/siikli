import '@testing-library/jest-dom/vitest'

// Polyfills often needed in JSDOM
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
;(globalThis as any).ResizeObserver = ResizeObserver

// If shadcn/ui or lucide-react crash in JSDOM, you can mock them
// import { vi } from 'vitest'
// vi.mock('lucide-react', () => new Proxy({}, { get: () => () => null }))
