import type { GetPackagingListGroupedByCustomerResponse, GetPackagingListGroupedByProductResponse } from '@siikli/shared'
import type { Mocked } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from 'axios'
import Decimal from 'decimal.js'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import { PackagingList } from './PackagingList'

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
    if (url === '/packaging-list/grouped-by/customer') {
      return Promise.resolve({
        data: {
          deliveryDate: '2021-01-01',
          groupedBy: 'customer',
          rows: [{
            customerId: '1',
            customerName: 'Test Customer',
            productName: 'Test Product',
            packageSize: 1,
            packageType: 'Test Package Type',
            freetext: 'Test Freetext',
            amount: new Decimal(10),
          }],
        } satisfies GetPackagingListGroupedByCustomerResponse,
      })
    }
    if (url === '/packaging-list/grouped-by/product') {
      return Promise.resolve({
        data: {
          deliveryDate: '2021-01-01',
          groupedBy: 'product',
          rows: [{
            productId: '1',
            productName: 'Test Product',
            packageSize: 1,
            packageType: 'Test Package Type',
            amount: new Decimal(10),
          }],
        } satisfies GetPackagingListGroupedByProductResponse,
      })
    }
    return Promise.resolve({ data: [] })
  })
})

afterEach(() => {
  vi.clearAllMocks()
})

it('renders Packaging List page by customer', async () => {
  renderWithProviders(<PackagingList />)
  expect(await screen.findByRole('heading', { name: 'Pakkauslista', level: 1 })).toBeInTheDocument()
  const createListButton = screen.getByRole('button', { name: 'Luo lista' })
  await userEvent.click(createListButton)
  expect(await screen.findByText('Test Customer')).toBeInTheDocument()
  expect(await screen.findByText('Test Product')).toBeInTheDocument()
})

it('renders Packaging List page', async () => {
  renderWithProviders(<PackagingList />)
  expect(await screen.findByRole('heading', { name: 'Pakkauslista', level: 1 })).toBeInTheDocument()

  const productRadio = screen.getByLabelText('Tuotteen mukaan')
  await userEvent.click(productRadio)

  const createListButton = screen.getByRole('button', { name: 'Luo lista' })
  await userEvent.click(createListButton)
  expect(await screen.findByText('Test Product')).toBeInTheDocument()
})
