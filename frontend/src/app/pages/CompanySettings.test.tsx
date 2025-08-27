import type { GetCustomersResponseDto } from '@siikli/shared'
import type { Mocked } from 'vitest'
import { act, fireEvent, screen } from '@testing-library/react'
import axios from 'axios'
import { a } from 'framer-motion/dist/types.d-Cjd591yU'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import { AuthProvider } from '../context/AuthContext'
import CompanySettings from './CompanySettings'

async function setValueToInput(field: string, value: string) {
  await act(async () => {
    const input = screen.getByLabelText(field)
    await fireEvent.change(input, { target: { value } })
  })
}

// Mock axios as before
vi.mock('axios')
const mockedAxios = axios as Mocked<typeof axios>

describe('orderForm', () => {
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
      return Promise.resolve({ data: [] })
    })

    mockedAxios.post.mockResolvedValue({ data: { id: '123', status: 'WAITING_FOR_DELIVERY' } })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders company settings', async () => {
    await act(async () => {
      renderWithProviders(<AuthProvider><CompanySettings /></AuthProvider>)
    })

    // Assert the heading is present
    expect(await screen.findByRole('heading', { name: 'Oma yritys' })).toBeInTheDocument()

    await setValueToInput('Nimi', 'J Company')

    await setValueToInput('Y-tunnus', '1234567890')
    await setValueToInput('Katuosoite', '123 Main St')
    await setValueToInput('Postinumero', '12345')
    await setValueToInput('Kaupunki', 'Anytown')

    await setValueToInput('Pankkitilin numero (IBAN)', 'FI000')
    await setValueToInput('Pankin nimi', 'Nordea')
    await setValueToInput('Laskun yhteenvetorivi', 'Potatoes - as per appendix')

    await setValueToInput('Puhelinnumero', '1234567890')
    await setValueToInput('Sähköposti', 'john.doe@example.com')
    await setValueToInput('WWW-sivu', 'https://www.jcompany.com')

    // Submit form directly - for some clicking "Save" button just doesn't work
    await act(async () => {
      const saveButton = await screen.findByRole('button', { name: 'Tallenna' })
      await fireEvent.click(saveButton)
    })

    // Verify the API call
    expect(mockedAxios.post).toHaveBeenCalledWith('/tenants', {
      name: 'J Company',
      streetAddress: '123 Main St',
      postalCode: '12345',
      city: 'Anytown',
      email: 'john.doe@example.com',
      phone: '1234567890',
      businessId: '1234567890',
      website: 'https://www.jcompany.com',
      invoiceBankAccount: 'FI000',
      invoiceBankName: 'Nordea',
      invoiceSumRow: 'Potatoes - as per appendix',
    })
  })
})
