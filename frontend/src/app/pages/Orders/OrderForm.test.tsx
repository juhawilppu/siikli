import type { GetCustomersResponseDto, GetOrderDto, GetPackageSettings, GetProductResponseDto } from '@siikli/shared'
import type { UserEvent } from '@testing-library/user-event'
import type { Mocked } from 'vitest'
import { OrderStatus } from '@siikli/shared'
import { act, fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from 'axios'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '../../../test/test-utils'
import OrderForm from './OrderForm'

async function setValueToSelect(field: string, value: string) {
  await act(async () => {
    const selectTrigger = screen.getByRole('combobox', { name: field })
    await fireEvent.click(selectTrigger)
    const productOption = await screen.findByRole('option', { name: value })
    await fireEvent.click(productOption)
  })
}

async function setValueToInput(field: string, value: string) {
  await act(async () => {
    const input = screen.getByLabelText(field)
    await fireEvent.change(input, { target: { value } })
  })
}

async function setValueToDate(user: UserEvent, field: string, value: string) {
  await act(async () => {
    const trigger = screen.getByRole('button', { name: field })
    await user.click(trigger)
    const popover = await screen.findByRole('dialog')
    await user.click(within(popover).getByText(value))
  })
}

// Mock axios as before
vi.mock('axios')
const mockedAxios = axios as Mocked<typeof axios>

describe('orderForm (create new order)', () => {
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
          } satisfies GetCustomersResponseDto,
        })
      }
      if (url === '/products') {
        return Promise.resolve({
          data: [{ id: '110', name: 'Siikli, pesty', price: '1.20', packageSize: 1, packageType: 'kg' }] satisfies GetProductResponseDto[],
        })
      }
      if (url === '/tenants/package-settings') {
        return Promise.resolve({
          data: { packageTypes: ['kg'], packageSizes: [1] } satisfies GetPackageSettings,
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

  it('renders order form', async () => {
    const user = userEvent.setup()

    await act(async () => {
      renderWithProviders(<OrderForm />)
    })

    // Assert the heading is present
    expect(await screen.findByRole('heading', { name: 'Uusi tilaus', level: 1 })).toBeInTheDocument()
    expect(screen.getByText('Täytä tilauksen tiedot')).toBeInTheDocument()
    expect(screen.getByLabelText('Toimituspäivä')).toBeInTheDocument()

    await setValueToSelect('Asiakas', 'J-Groceries')

    await setValueToDate(user, 'Toimituspäivä', '26')

    await setValueToSelect('Tuote', 'Siikli, pesty')
    await setValueToInput('Määrä (kg)', '10')
    await setValueToSelect('Pakkaustyyppi', 'kg')
    await setValueToSelect('Pakkauskoko', '1')

    // Wait for the total to be calculated and displayed
    const total1 = await screen.findByText('12,00 €')
    expect(total1).toBeInTheDocument()

    await setValueToInput('Hinta (€/kg) ALV 0 %', '1,40')

    // Wait for the updated total after price change
    const total2 = await screen.findByText('14,00 €')
    expect(total2).toBeInTheDocument()

    // Submit form directly - for some reason clicking "Save" button just doesn't work in this view
    await act(async () => {
      const form = screen.getByRole('form')
      await fireEvent.submit(form)
    })

    // Verify the API call
    expect(mockedAxios.post).toHaveBeenCalledWith('/orders', {
      customerId: '200',
      deliveryDate: '2025-08-26',
      hasNote: false,
      status: 'WAITING_FOR_DELIVERY',
      items: [
        {
          id: undefined,
          deleted: false,
          createdAt: expect.any(Date),
          amount: '10',
          freetext: '',
          packageSize: 1,
          packageType: 'kg',
          packages: 10,
          price: '1.40',
          productId: '110',
          unsaved: true,
        },
      ],
      noteBody: null,
      noteHeader: null,
    })
  })
})

describe('orderForm (edit existing order)', () => {
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
      if (url === '/orders/123') {
        return Promise.resolve({
          data: {
            id: '123',
            customerId: '200',
            deliveryDate: '2025-08-26',
            hasNote: false,
            status: OrderStatus.WAITING_FOR_DELIVERY,
            items: [
              {
                id: '110',
                productId: '110',
                amount: '10',
                price: '1.20',
                packageSize: 1,
                packageType: 'kg',
                freetext: '',
                createdAt: new Date(),
                packages: 10,
              },
              {
                id: '111',
                productId: '111',
                amount: '20',
                price: '1.30',
                packageSize: 2,
                packageType: 'kg',
                freetext: '',
                createdAt: new Date(),
                packages: 10,
              },
            ],
            noteBody: '',
            noteHeader: '',
            orderNumber: 1000,
            invoiceId: null,
            invoiceNumber: null,
          } satisfies GetOrderDto,
        })
      }
      if (url === '/customers') {
        return Promise.resolve({
          data: {
            customers: [{ id: '200', name: 'J-Groceries', companyLegalName: 'J-Groceries', discount: '10', invoiceReference: '1234567890', streetAddress: '123 Main St', postalCode: '12345', city: 'Anytown', email: 'john.doe@example.com', phone: '1234567890', businessId: '1234567890' }],
          } satisfies GetCustomersResponseDto,
        })
      }
      if (url === '/products') {
        return Promise.resolve({
          data: [{ id: '110', name: 'Siikli, pesty', price: '1.20', packageSize: 1, packageType: 'kg' }, { id: '111', name: 'Rosamunda', price: '1.30', packageSize: 2, packageType: 'kg' }] satisfies GetProductResponseDto[],
        })
      }
      if (url === '/tenants/package-settings') {
        return Promise.resolve({
          data: { packageTypes: ['kg'], packageSizes: [1] } satisfies GetPackageSettings,
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

  it('renders order form', async () => {
    await act(async () => {
      renderWithProviders(<OrderForm />, { route: '/orders/:orderId', params: { orderId: '123' } })
    })

    // Verify that the order details were fetched
    expect(mockedAxios.get).toHaveBeenCalledWith('/orders/123')

    // Assert the heading is present
    expect(await screen.findByRole('heading', { name: 'Tilaus', level: 1 })).toBeInTheDocument()
    expect(screen.getByText('Täytä tilauksen tiedot')).toBeInTheDocument()
    expect(screen.getByLabelText('Toimituspäivä')).toBeInTheDocument()

    // Wait for the updated total after price change
    const total = await screen.findByText('38,00 €')
    expect(total).toBeInTheDocument()

    // Now try submitting the form
    await act(async () => {
      const form = screen.getByRole('form')
      await fireEvent.submit(form)
    })

    // Verify the API call
    expect(mockedAxios.post).toHaveBeenCalledWith('/orders/123', {
      customerId: '200',
      deliveryDate: '2025-08-26',
      status: OrderStatus.WAITING_FOR_DELIVERY,
      hasNote: false,
      items: [
        {
          id: '110',
          createdAt: expect.any(Date),
          amount: '10.00',
          freetext: '',
          packageSize: 1,
          packageType: 'kg',
          packages: 10,
          price: '1.20',
          productId: '110',
        },
        {
          id: '111',
          createdAt: expect.any(Date),
          amount: '20.00',
          freetext: '',
          packageSize: 2,
          packageType: 'kg',
          packages: 10,
          price: '1.30',
          productId: '111',
        },
      ],
      noteBody: null,
      noteHeader: null,
    })
  })
})
