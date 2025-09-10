import type { GetCustomersResponse } from '@siikli/shared'
import type { Mocked } from 'vitest'
import { screen } from '@testing-library/react'
import axios from 'axios'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { renderWithProviders } from '../../../test/test-utils'
import { Customers } from './Customers'

vi.mock('axios')
const mockedAxios = axios as Mocked<typeof axios>

beforeEach(() => {
  mockedAxios.get.mockImplementation((url) => {
    if (url === '/customers') {
      return Promise.resolve({
        data: {
          customers: [{ id: '1', name: 'J-Kauppa', companyLegalName: 'J-Kauppa', discount: '10', invoiceReference: '1234567890', streetAddress: '123 Main St', postalCode: '12345', city: 'Anytown', email: 'john.doe@example.com', phone: '1234567890', businessId: '1234567890' }],
        } satisfies GetCustomersResponse,
      })
    }
    return Promise.resolve({ data: [] })
  })
})

afterEach(() => {
  vi.clearAllMocks()
})

it('renders Customers page', async () => {
  renderWithProviders(<Customers />)
  expect(await screen.findByRole('heading', { name: 'Asiakkaat', level: 1 })).toBeInTheDocument()
  expect(await screen.findByText('J-Kauppa')).toBeInTheDocument()
})
