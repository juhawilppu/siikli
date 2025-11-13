import type { GetCustomersResponse, GetOrdersResponse } from '@siikli/shared'
import type { Mocked } from 'vitest'
import { OrderStatus } from '@siikli/shared'
import { screen } from '@testing-library/react'
import axios from 'axios'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import Waybills from './Waybills'

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

  mockedAxios.get.mockImplementation((url) => {
    if (url === '/orders') {
      return Promise.resolve({ data: [{ id: '1', deliveryDate: '2021-01-01', orderNumber: 1, status: OrderStatus.WAITING_FOR_DELIVERY, customer: { id: '1', name: 'John Doe' }, total: '100' }] satisfies GetOrdersResponse[] })
    }
    if (url === '/customers') {
      return Promise.resolve({
        data: {
          customers: [{ id: '1', name: 'John Doe', companyLegalName: 'John Doe', discount: '10', invoiceReference: '1234567890', streetAddress: '123 Main St', postalCode: '12345', city: 'Anytown', email: 'john.doe@example.com', phone: '1234567890', businessId: '1234567890' }],
        } satisfies GetCustomersResponse,
      })
    }
    return Promise.resolve({ data: [] })
  })
})

afterEach(() => {
  vi.clearAllMocks()
})

it('renders Waybills page', async () => {
  renderWithProviders(<Waybills />)
  expect(await screen.findByRole('heading', { name: 'Waybills', level: 1 })).toBeInTheDocument()
  expect(await screen.findByText('Filters')).toBeInTheDocument()
})
