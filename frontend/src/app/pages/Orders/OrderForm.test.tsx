import type { GetCustomersResponse, GetOrderResponse, GetPackageSettingsResponse, GetProductsResponse, PostCreateOrderRequest } from '@siikli/shared'
import type { UserEvent } from '@testing-library/user-event'
import type { Mocked } from 'vitest'
import type { z } from 'zod'
import { dateToIso, OrderStatus } from '@siikli/shared'
import { act, fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '../../../test/test-utils'
import OrderForm from './OrderForm'

async function setValueToSelect(field: string, value: string, nth = 0) {
  await act(async () => {
    const selectTriggers = screen.queryAllByRole('combobox', { name: field })
    const selectTrigger = selectTriggers[nth]
    await fireEvent.click(selectTrigger)
    const productOption = await screen.findByRole('option', { name: value })
    await fireEvent.click(productOption)
  })
}
async function setValueToInput(field: string, value: string, nth = 0) {
  await act(async () => {
    const inputs = screen.queryAllByLabelText(field)
    const input = inputs[nth]
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

describe('orderForm (empty state)', () => {
  beforeAll(() => {
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
  })

  beforeEach(() => {
    mockedAxios.get.mockImplementation((url) => {
      if (url === '/customers') {
        return Promise.resolve({
          data: { customers: [] } satisfies GetCustomersResponse,
        })
      }
      if (url === '/products') {
        return Promise.resolve({
          data: [] satisfies GetProductsResponse[],
        })
      }
      if (url === '/tenants/package-settings') {
        return Promise.resolve({
          data: { packageTypes: ['kg'], packageSizes: [1, 5, 10] } satisfies GetPackageSettingsResponse,
        })
      }
      if (url === '/orders/limit') {
        return Promise.resolve({ data: { remaining: 10 } satisfies { remaining: number } })
      }
      return Promise.resolve({ data: [] })
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('shows empty state messages when no customers or products exist', async () => {
    await act(async () => {
      renderWithProviders(<OrderForm />)
    })

    expect(await screen.findByRole('link', { name: 'Lisää ensimmäinen asiakas' })).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: 'Lisää ensimmäinen tuote' })).toBeInTheDocument()
  })
})

describe('orderForm (create new order)', () => {
  const CUSTOMER_ID = uuidv4()
  const PRODUCT_ID = uuidv4()
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
            customers: [{ id: CUSTOMER_ID, name: 'J-Groceries', companyLegalName: 'J-Groceries', discount: '10', invoiceReference: '1234567890', streetAddress: '123 Main St', postalCode: '12345', city: 'Anytown', email: 'john.doe@example.com', phone: '1234567890', businessId: '1234567890' }],
          } satisfies GetCustomersResponse,
        })
      }
      if (url === '/products') {
        return Promise.resolve({
          data: [{ id: PRODUCT_ID, name: 'Siikli, pesty', price: '1.20', packageSize: 1, packageType: 'kg' }] satisfies GetProductsResponse[],
        })
      }
      if (url === '/tenants/package-settings') {
        return Promise.resolve({
          data: { packageTypes: ['kg'], packageSizes: [1, 5, 10] } satisfies GetPackageSettingsResponse,
        })
      }
      if (url === '/orders/limit') {
        return Promise.resolve({ data: { remaining: 10 } satisfies { remaining: number } })
      }
      return Promise.resolve({ data: [] })
    })

    mockedAxios.post.mockResolvedValue({ data: { id: uuidv4(), status: 'WAITING_FOR_DELIVERY' } })
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

    const DAY_OF_MONTH = 26
    await setValueToDate(user, 'Toimituspäivä', DAY_OF_MONTH.toString())

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
      customerId: CUSTOMER_ID,
      deliveryDate: dateToIso(new Date(new Date().getFullYear(), new Date().getMonth(), DAY_OF_MONTH)),
      hasNote: false,
      status: 'WAITING_FOR_DELIVERY',
      items: [
        {
          id: undefined,
          amount: '10',
          packageSize: 1,
          packageType: 'kg',
          packages: 10,
          price: '1.40',
          productId: PRODUCT_ID,
        },
      ],
      noteBody: undefined,
      noteHeader: undefined,
    })
  })
})

describe('orderForm (edit existing order)', () => {
  const ORDER_ID = uuidv4()
  const CUSTOMER_ID = uuidv4()

  const ORDER_ITEM1_ID = uuidv4()
  const PRODUCT1_ID = uuidv4()

  const ORDER_ITEM2_ID = uuidv4()
  const PRODUCT2_ID = uuidv4()

  const PRODUCT3_ID = uuidv4()

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
      if (url === `/orders/${ORDER_ID}`) {
        return Promise.resolve({
          data: {
            id: ORDER_ID,
            customerId: CUSTOMER_ID,
            deliveryDate: '2025-08-26',
            hasNote: false,
            status: OrderStatus.WAITING_FOR_DELIVERY,
            items: [
              {
                id: ORDER_ITEM1_ID,
                productId: PRODUCT1_ID,
                amount: '10',
                price: '1.20',
                packageSize: 1,
                packageType: 'kg',
                freetext: '',
                createdAt: new Date(),
                packages: 10,
              },
              {
                id: ORDER_ITEM2_ID,
                productId: PRODUCT2_ID,
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
          } satisfies GetOrderResponse,
        })
      }
      if (url === '/customers') {
        return Promise.resolve({
          data: {
            customers: [{ id: CUSTOMER_ID, name: 'J-Groceries', companyLegalName: 'J-Groceries', discount: '10', invoiceReference: '1234567890', streetAddress: '123 Main St', postalCode: '12345', city: 'Anytown', email: 'john.doe@example.com', phone: '1234567890', businessId: '1234567890' }],
          } satisfies GetCustomersResponse,
        })
      }
      if (url === '/products') {
        return Promise.resolve({
          data: [
            { id: PRODUCT1_ID, name: 'Siikli, pesty', price: '1.20', packageSize: 1, packageType: 'kg' },
            { id: PRODUCT2_ID, name: 'Rosamunda', price: '1.30', packageSize: 2, packageType: 'kg' },
            { id: PRODUCT3_ID, name: 'Siikli, ei hintaa', price: undefined, packageSize: null, packageType: null },
          ] satisfies GetProductsResponse[],
        })
      }
      if (url === '/tenants/package-settings') {
        return Promise.resolve({
          data: { packageTypes: ['kg'], packageSizes: [1, 5, 10] } satisfies GetPackageSettingsResponse,
        })
      }
      if (url === '/orders/limit') {
        return Promise.resolve({ data: { remaining: 10 } satisfies { remaining: number } })
      }
      return Promise.resolve({ data: [] })
    })

    mockedAxios.post.mockResolvedValue({ data: { id: uuidv4(), status: 'WAITING_FOR_DELIVERY' } })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders order form', async () => {
    await act(async () => {
      renderWithProviders(<OrderForm />, { route: '/orders/:orderId', params: { orderId: ORDER_ID } })
    })

    // Verify that the order details were fetched
    expect(mockedAxios.get).toHaveBeenCalledWith(`/orders/${ORDER_ID}`)

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
    expect(mockedAxios.post).toHaveBeenCalledWith(`/orders/${ORDER_ID}`, {
      customerId: CUSTOMER_ID,
      deliveryDate: '2025-08-26',
      status: OrderStatus.WAITING_FOR_DELIVERY,
      hasNote: false,
      noteBody: undefined,
      noteHeader: undefined,
      items: [
        {
          id: ORDER_ITEM1_ID,
          amount: '10.00',
          packageSize: 1,
          packageType: 'kg',
          packages: 10,
          price: '1.20',
          productId: PRODUCT1_ID,
        },
        {
          id: ORDER_ITEM2_ID,
          amount: '20.00',
          packageSize: 2,
          packageType: 'kg',
          packages: 10,
          price: '1.30',
          productId: PRODUCT2_ID,
        },
      ],
    } satisfies z.infer<typeof PostCreateOrderRequest>)
  })

  it('handles validation errors', async () => {
    const user = userEvent.setup()

    await act(async () => {
      renderWithProviders(<OrderForm />)
    })

    // Test missing customer
    await act(async () => {
      const form = screen.getByRole('form')
      await fireEvent.submit(form)
    })
    expect(screen.getByText('Asiakas ei voi olla tyhjä')).toBeInTheDocument()

    // Add customer
    await setValueToSelect('Asiakas', 'J-Groceries')

    // Test missing delivery date
    await act(async () => {
      const form = screen.getByRole('form')
      await fireEvent.submit(form)
    })
    expect(screen.getByText('Toimituspäivä ei voi olla tyhjä')).toBeInTheDocument()

    // Add delivery date
    await setValueToDate(user, 'Toimituspäivä', '26')

    // Test missing product
    await act(async () => {
      const form = screen.getByRole('form')
      await fireEvent.submit(form)
    })
    expect(screen.getByText('Valitse tuote tai poista rivi')).toBeInTheDocument()

    // Add product
    await setValueToSelect('Tuote', 'Siikli, ei hintaa')

    // Test missing amount
    await act(async () => {
      const form = screen.getByRole('form')
      await fireEvent.submit(form)
    })
    expect(screen.getByText('Valitse määrä tuotteelle Siikli, ei hintaa tai poista rivi')).toBeInTheDocument()

    // Set invalid amount
    await setValueToInput('Määrä (kg)', '-1')

    // Test invalid amount
    await act(async () => {
      const form = screen.getByRole('form')
      await fireEvent.submit(form)
    })
    expect(screen.getByText('Valitse määrä tuotteelle Siikli, ei hintaa tai poista rivi')).toBeInTheDocument()

    // Set valid amount
    await setValueToInput('Määrä (kg)', '10')

    // Test missing price
    await act(async () => {
      const form = screen.getByRole('form')
      await fireEvent.submit(form)
    })
    expect(screen.getByText('Valitse hinta tai poista rivi')).toBeInTheDocument()

    // Set price
    await setValueToInput('Hinta (€/kg) ALV 0 %', '1,40')

    // Test missing package size
    await act(async () => {
      const form = screen.getByRole('form')
      await fireEvent.submit(form)
    })
    expect(screen.getByText('Valitse pakkauskoko tai poista rivi')).toBeInTheDocument()

    // Set package size
    await setValueToSelect('Pakkauskoko', '1')

    // Test missing package type
    await act(async () => {
      const form = screen.getByRole('form')
      await fireEvent.submit(form)
    })
    expect(screen.getByText('Valitse pakkaustyyppi tai poista rivi')).toBeInTheDocument()

    // Verify no API calls have been made so far
    expect(mockedAxios.post).not.toHaveBeenCalled()

    // Set package type
    await setValueToSelect('Pakkaustyyppi', 'kg')

    await act(async () => {
      const form = screen.getByRole('form')
      await fireEvent.submit(form)
    })

    // Verify the API call
    expect(mockedAxios.post).toHaveBeenCalled()
  })

  it('handles adding multiple order items', async () => {
    const user = userEvent.setup()

    await act(async () => {
      renderWithProviders(<OrderForm />)
    })

    await setValueToSelect('Asiakas', 'J-Groceries')
    await setValueToDate(user, 'Toimituspäivä', '26')

    // Add first item
    await setValueToSelect('Tuote', 'Siikli, pesty')
    await setValueToInput('Määrä (kg)', '10')
    await setValueToSelect('Pakkaustyyppi', 'kg')
    await setValueToSelect('Pakkauskoko', '1')
    await setValueToInput('Hinta (€/kg) ALV 0 %', '1,20')

    // Click add new item button
    const addButton = screen.getByRole('button', { name: 'Lisää tuote' })
    await user.click(addButton)

    // Add second item
    await setValueToSelect('Tuote', 'Rosamunda', 1)
    await setValueToInput('Määrä (kg)', '20', 1)
    await setValueToSelect('Pakkaustyyppi', 'kg', 1)
    await setValueToSelect('Pakkauskoko', '5', 1)
    await setValueToInput('Hinta (€/kg) ALV 0 %', '1,30', 1)

    // Verify total is calculated correctly
    const total = await screen.findByText('38,00 €')
    expect(total).toBeInTheDocument()

    // Submit form
    await act(async () => {
      const form = screen.getByRole('form')
      await fireEvent.submit(form)
    })

    // Verify API call contains both items
    expect(mockedAxios.post).toHaveBeenCalledWith('/orders', expect.objectContaining({
      items: [
        {
          amount: '10',
          packageSize: 1,
          packageType: 'kg',
          packages: 10,
          price: '1.20',
          productId: PRODUCT1_ID,
          id: undefined,
        },
        {
          amount: '20',
          packageSize: 5,
          packageType: 'kg',
          packages: 4,
          price: '1.30',
          productId: PRODUCT2_ID,
          id: undefined,
        },
      ],
    }))
  })
})

describe('orderForm (view invoiced order)', () => {
  const ORDER_ID = uuidv4()
  const CUSTOMER_ID = uuidv4()
  const PRODUCT_ID = uuidv4()
  const ORDER_ITEM_ID = uuidv4()

  beforeAll(() => {
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
  })

  beforeEach(() => {
    mockedAxios.get.mockImplementation((url) => {
      if (url === `/orders/${ORDER_ID}`) {
        return Promise.resolve({
          data: {
            id: ORDER_ID,
            customerId: CUSTOMER_ID,
            deliveryDate: '2025-08-26',
            status: OrderStatus.INVOICED,
            hasNote: true,
            noteBody: 'Test Note Body',
            noteHeader: 'Test Note Header',
            items: [
              {
                id: ORDER_ITEM_ID,
                productId: PRODUCT_ID,
                amount: '10',
                price: '1.20',
                packageSize: 1,
                packageType: 'kg',
                freetext: '',
                createdAt: new Date(),
                packages: 10,
              },
            ],
            orderNumber: 1000,
            invoiceId: 'invoice-123',
            invoiceNumber: 1001,
          } satisfies GetOrderResponse,
        })
      }
      if (url === '/customers') {
        return Promise.resolve({
          data: {
            customers: [{ id: CUSTOMER_ID, name: 'J-Groceries', companyLegalName: 'J-Groceries', discount: '10', invoiceReference: '1234567890', streetAddress: '123 Main St', postalCode: '12345', city: 'Anytown', email: 'john.doe@example.com', phone: '1234567890', businessId: '1234567890' }],
          } satisfies GetCustomersResponse,
        })
      }
      if (url === '/products') {
        return Promise.resolve({
          data: [{ id: PRODUCT_ID, name: 'Siikli, pesty', price: '1.20', packageSize: 1, packageType: 'kg' }] satisfies GetProductsResponse[],
        })
      }
      if (url === '/tenants/package-settings') {
        return Promise.resolve({
          data: { packageTypes: ['kg'], packageSizes: [1, 5, 10] } satisfies GetPackageSettingsResponse,
        })
      }
      if (url === '/orders/limit') {
        return Promise.resolve({ data: { remaining: 10 } satisfies { remaining: number } })
      }
      return Promise.resolve({ data: [] })
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('shows invoiced order in read-only mode', async () => {
    await act(async () => {
      renderWithProviders(<OrderForm />, { route: '/orders/:orderId', params: { orderId: ORDER_ID } })
    })

    // Verify form fields are disabled
    expect(await screen.findByRole('combobox', { name: 'Asiakas' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Toimituspäivä' })).toBeDisabled()
    expect(screen.getByRole('combobox', { name: 'Tuote' })).toBeDisabled()
    expect(screen.getByLabelText('Määrä (kg)')).toBeDisabled()
    expect(screen.getByRole('combobox', { name: 'Pakkaustyyppi' })).toBeDisabled()
    expect(screen.getByRole('combobox', { name: 'Pakkauskoko' })).toBeDisabled()
    expect(screen.getByLabelText('Hinta (€/kg) ALV 0 %')).toBeDisabled()

    // Verify note info is shown
    expect(screen.getByLabelText('Otsikko')).toHaveValue('Test Note Header')
    expect(screen.getByLabelText('Sisältö')).toHaveValue('Test Note Body')

    // Verify waybill and invoice info is shown
    expect(screen.getByText('Laskutettu')).toBeInTheDocument()
    expect(screen.getByText('Kuormakirja')).toBeInTheDocument()
    expect(screen.getByText('Lasku')).toBeInTheDocument()
  })
})
