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

// This prevents the "target.hasPointerCapture is not a function" error.
class PointerEvent extends Event {}
window.PointerEvent = PointerEvent as any

window.HTMLElement.prototype.hasPointerCapture = () => false
window.HTMLElement.prototype.releasePointerCapture = () => {}
window.HTMLElement.prototype.setPointerCapture = () => {}

window.HTMLElement.prototype.scrollIntoView = () => {}
