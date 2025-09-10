import type { Mocked } from 'vitest'
import { screen } from '@testing-library/react'
import axios from 'axios'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import { SalesReport } from './SalesReport'

vi.mock('axios')
const mockedAxios = axios as Mocked<typeof axios>

beforeEach(() => {
  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })

  mockedAxios.get.mockImplementation(() => {
    return Promise.resolve({ data: [] })
  })
})

afterEach(() => {
  vi.clearAllMocks()
})

it('renders Sales Report page', async () => {
  renderWithProviders(<SalesReport />)
  expect(await screen.findByRole('heading', { name: 'Myyntiraportti', level: 1 })).toBeInTheDocument()
  expect(await screen.findByText('Hakuehdot')).toBeInTheDocument()
})
