import type { GetCustomersResponse, GetPackageSettingsResponse, GetProductsResponse } from '@siikli/shared'
import type { Mocked } from 'vitest'
import { act, fireEvent, screen } from '@testing-library/react'
import axios from 'axios'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { Dialog } from '@/components/ui/dialog'
import { renderWithProviders } from '../../../test/test-utils'
import ProductForm from './ProductForm'

async function setValueToInput(field: string, value: string) {
  await act(async () => {
    const input = screen.getByLabelText(field)
    await fireEvent.change(input, { target: { value } })
  })
}

// Mock axios as before
vi.mock('axios')
const mockedAxios = axios as Mocked<typeof axios>

describe('productForm', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })
  beforeEach(() => {
    mockedAxios.get.mockImplementation((url) => {
      if (url === '/customers') {
        return Promise.resolve({
          data: {
            customers: [{ id: '200', name: 'J-Groceries', companyLegalName: 'J-Groceries', discount: '10', invoiceReference: '1234567890', streetAddress: '123 Main St', postalCode: '12345', city: 'Anytown', email: 'john.doe@example.com', phone: '1234567890', businessId: '1234567890' }],
          } satisfies GetCustomersResponse,
        })
      }
      if (url === '/products') {
        return Promise.resolve({
          data: [{ id: '110', name: 'Siikli, pesty', price: '1.20', packageSize: 1, packageType: 'kg' }] satisfies GetProductsResponse[],
        })
      }
      if (url === '/tenants/package-settings') {
        return Promise.resolve({
          data: { packageTypes: ['kg'], packageSizes: [1] } satisfies GetPackageSettingsResponse,
        })
      }
      if (url === '/orders/limit') {
        return Promise.resolve({ data: { remaining: 10 } satisfies { remaining: number } })
      }
      return Promise.resolve({ data: [] })
    })

    mockedAxios.post.mockResolvedValue({ data: { id: '123', status: 'WAITING_FOR_DELIVERY' } })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders product form', async () => {
    await act(async () => {
      renderWithProviders(
        <Dialog open>
          <ProductForm refPackageTypes={[]} refPackageSizes={[]} hide={() => { }} onSave={() => { }} />
        </Dialog>,
      )
    })

    // Assert the heading is present
    expect(await screen.findByRole('heading', { name: 'New product' })).toBeInTheDocument()

    await setValueToInput('Name *', 'Siikli, pesty')

    await act(async () => {
      const trigger = screen.getByRole('button', { name: 'Pricing' })
      await fireEvent.click(trigger)
    })

    await setValueToInput('Price excl. VAT (€)', '1,40')
    await act(async () => {
      const input = screen.getByLabelText('Price excl. VAT (€)')
      await fireEvent.blur(input)
    })

    // Submit form directly - for some clicking "Save" button just doesn't work
    await act(async () => {
      const saveButton = await screen.findByRole('button', { name: 'Save' })
      await fireEvent.click(saveButton)
    })

    // Verify the API call
    expect(mockedAxios.post).toHaveBeenCalledWith('/products', {
      name: 'Siikli, pesty',
      price: '1.40',
      packageSize: undefined,
      packageType: '',
    })
  })
})
