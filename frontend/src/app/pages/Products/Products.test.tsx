import type { GetPackageSettingsResponse, GetProductsResponse } from '@siikli/shared'
import type { Mocked } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from 'axios'
import { act } from 'react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { renderWithProviders } from '../../../test/test-utils'
import Products from './Products'

async function openAccordion(accordion: string) {
  await act(async () => {
    const trigger = screen.getByRole('button', { name: accordion })
    await fireEvent.click(trigger)
  })
}

vi.mock('axios')
const mockedAxios = axios as Mocked<typeof axios>

beforeEach(() => {
  mockedAxios.get.mockImplementation((url) => {
    if (url === '/products') {
      return Promise.resolve({
        data:
        [{ id: '1', name: 'Test Product', price: '100', packageSize: 1, packageType: 'kpl' }] satisfies GetProductsResponse[],
      })
    }
    if (url === '/tenants/package-settings') {
      return Promise.resolve({
        data: { packageTypes: ['kpl'], packageSizes: [1] } satisfies GetPackageSettingsResponse,
      })
    }
    return Promise.resolve({ data: [] })
  })
})

afterEach(() => {
  vi.clearAllMocks()
})

it('renders Products page', async () => {
  renderWithProviders(<Products />)
  expect(await screen.findByRole('heading', { name: 'Products', level: 1 })).toBeInTheDocument()
  expect(await screen.findByText('Test Product')).toBeInTheDocument()
})

it('should save product', async () => {
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

  mockedAxios.post.mockResolvedValue({ data: { id: '123' } })

  const user = userEvent.setup()

  await act(async () => {
    renderWithProviders(<Products />)
  })

  // Wait for initial data load
  await screen.findByText('Test Product')

  // Click new product button
  await user.click(screen.getByRole('button', { name: /add product/i }))

  // Fill in product details
  await user.type(screen.getByLabelText(/name/i), 'New Test Product')

  await openAccordion('Pricing')
  await user.type(screen.getByLabelText(/price/i), '19,99')

  await openAccordion('Packaging')

  // Click save
  await user.click(screen.getByRole('button', { name: /save/i }))

  // Submit form directly - for some reason clicking "Save" button just doesn't work
  await act(async () => {
    const saveButton = await screen.findByRole('button', { name: 'Save' })
    await fireEvent.click(saveButton)
  })

  // Verify POST request was made with correct data
  expect(mockedAxios.post).toHaveBeenCalledWith('/products', {
    name: 'New Test Product',
    price: '19.99',
    packageSize: undefined,
    packageType: '',
  })

  // Verify success toast is shown
  expect(await screen.findByText(/product created/i)).toBeInTheDocument()
})

it('allows deleting a product', async () => {
  mockedAxios.delete.mockResolvedValue({ data: {} })
  mockedAxios.get.mockImplementation((url) => {
    if (url === '/products') {
      return Promise.resolve({
        data: [{ id: '123', name: 'Test Product', price: '10.00' }],
      })
    }
    if (url === '/tenants/package-settings') {
      return Promise.resolve({
        data: { packageTypes: ['kg'], packageSizes: [1] },
      })
    }
    return Promise.resolve({ data: [] })
  })

  const user = userEvent.setup()

  await act(async () => {
    renderWithProviders(<Products />)
  })

  // Wait for products to load
  await screen.findByText('Test Product')

  // Click delete button
  await user.click(screen.getByTestId('delete-123-button'))

  // Confirm deletion in dialog
  await user.click(screen.getByRole('button', { name: /delete/i }))

  // Verify DELETE request was made
  expect(mockedAxios.delete).toHaveBeenCalledWith('/products/123')

  // Verify success toast is shown
  expect(await screen.findByText(/product deleted/i)).toBeInTheDocument()
})
