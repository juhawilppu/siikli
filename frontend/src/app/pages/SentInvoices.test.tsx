import type { GetCustomersResponse, GetInvoicesResponse } from '@siikli/shared'
import type { Mocked } from 'vitest'
import { dateToIso } from '@siikli/shared'
import { screen } from '@testing-library/react'
import axios from 'axios'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import { SentInvoices } from './SentInvoices'

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
    if (url === '/invoices/list') {
      return Promise.resolve({
        data:
              [{
                id: '1',
                invoiceId: 123,
                customerId: '1',
                customerName: 'Test Customer',
                createdAt: dateToIso(new Date()),
                total: '100',
                status: 'PENDING',
              }] satisfies GetInvoicesResponse[],
      })
    }
    if (url === '/customers') {
      return Promise.resolve({
        data: {
          customers: [{ id: '1', name: 'Test Customer', companyLegalName: 'Test Customer', discount: '10', invoiceReference: '1234567890', streetAddress: '123 Main St', postalCode: '12345', city: 'Anytown', email: 'john.doe@example.com', phone: '1234567890', businessId: '1234567890' }],
        } satisfies GetCustomersResponse,
      })
    }
    return Promise.resolve({ data: [] })
  })
})

afterEach(() => {
  vi.clearAllMocks()
})

it('renders Sent Invoices page', async () => {
  renderWithProviders(<SentInvoices />)
  expect(await screen.findByRole('heading', { name: 'Lähetetyt laskut', level: 1 })).toBeInTheDocument()
  expect(await screen.findByText('Test Customer')).toBeInTheDocument()
})
