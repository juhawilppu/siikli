import type { Mocked } from 'vitest'
import { screen } from '@testing-library/react'
import axios from 'axios'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { renderWithProviders } from '../../../test/test-utils'
import Orders from './Orders'

vi.mock('axios')
const mockedAxios = axios as Mocked<typeof axios>

beforeEach(() => {
  mockedAxios.get.mockImplementation((url) => {
    if (url === '/orders') {
      return Promise.resolve({ data: [] })
    }
    if (url === '/customers') {
      return Promise.resolve({
        data: {
          customers: [],
        },
      })
    }
    console.log('url', url)
    return Promise.resolve({ data: [] })
  })
})

afterEach(() => {
  vi.clearAllMocks()
})

it('renders Orders page', async () => {
  renderWithProviders(<Orders />)
  expect(await screen.findByRole('heading', { name: 'Tilaukset', level: 1 })).toBeInTheDocument()
})
