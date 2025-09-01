import type { GetCustomersResponse, GetOrdersResponse } from '@siikli/shared'
import type { Mocked } from 'vitest'
import { OrderStatus } from '@siikli/shared'
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

it('renders Orders page', async () => {
  renderWithProviders(<Orders />)
  expect(await screen.findByRole('heading', { name: 'Tilaukset', level: 1 })).toBeInTheDocument()
})
