import type { GetCompanySettingsResponse, GetCurrentUserResponse, GetCustomersResponse, GetUsersResponse } from '@siikli/shared'
import type { Mocked } from 'vitest'
import { act, fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from 'axios'
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

describe('companySettings - company tab', () => {
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
      if (url === '/auth/current-user') {
        return Promise.resolve({
          data: { authenticated: true, userId: '1', email: 'owner@example.com', role: 'OWNER', tenantId: '1', initials: 'JD', signupCompleted: true } satisfies GetCurrentUserResponse,
        })
      }
      if (url === '/tenants') {
        return Promise.resolve({
          data:
            { id: '1', name: 'J Company', streetAddress: '123 Main St', postalCode: '12345', city: 'Anytown', email: 'john.doe@example.com', phone: '1234567890', businessId: '1234567890', website: 'https://www.jcompany.com', invoiceBankAccount: 'FI000', invoiceBankName: 'Nordea', invoiceSumRow: 'Potatoes - as per appendix', subscriptionType: 'PREMIUM', trialEndDate: '2021-01-01', subscriptionEndDate: '2040-01-01', subscriptionStartDate: '2021-01-01' } satisfies GetCompanySettingsResponse,
        })
      }
      if (url === '/tenants/users') {
        return Promise.resolve({
          data: [
            { id: '1', email: 'owner@example.com', role: 'OWNER', lastLoginAt: '2021-01-01' },
            { id: '2', email: 'user@example.com', role: 'USER', lastLoginAt: '2021-01-01' },
          ] satisfies GetUsersResponse[],
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

  it('renders users list and allows adding new user', async () => {
    const view = renderWithProviders(<AuthProvider><CompanySettings /></AuthProvider>)

    // Switch to Users tab
    const usersTab = await screen.findByRole('tab', { name: 'Käyttäjät' })
    console.log('Before clicking Users tab, DOM:', view.container.innerHTML)
    await act(async () => {
      await userEvent.click(usersTab)
    })
    await screen.findByRole('tabpanel', { name: 'Käyttäjät' })

    // Verify existing users are shown
    await screen.findByText('owner@example.com')
    await screen.findByText('user@example.com')

    // Test adding new user
    const addUserButton = screen.getByRole('button', { name: 'Lisää käyttäjä' })
    await act(async () => {
      await userEvent.click(addUserButton)
    })

    // Fill in new user details
    await setValueToInput('Sähköposti', 'newuser@example.com')

    // Submit form
    const submitButton = screen.getByRole('button', { name: 'Tallenna käyttäjä' })
    await act(async () => {
      await userEvent.click(submitButton)
    })

    // Verify API was called correctly
    expect(mockedAxios.post).toHaveBeenCalledWith('/tenants/users', {
      email: 'newuser@example.com',
      role: 'USER',
    })

    // Verify success message shown
    await screen.findByText('Käyttäjä lisätty')
    await screen.findByText('Käyttäjä on lisätty onnistuneesti.')
  })

  it('renders subscription tab and allows switching subscription', async () => {
    renderWithProviders(<AuthProvider><CompanySettings /></AuthProvider>)

    // Switch to Subscription tab
    const subscriptionTab = await screen.findByRole('tab', { name: 'Tilaus' })
    await act(async () => {
      await userEvent.click(subscriptionTab)
    })
    await screen.findByRole('tabpanel', { name: 'Tilaus' })

    // Verify current subscription info is shown
    await screen.findByText('Nykyinen tilaus: Premium')
  })

  it('renders others tab and allows deleting company', async () => {
    renderWithProviders(<AuthProvider><CompanySettings /></AuthProvider>)

    // Switch to Others tab
    const othersTab = await screen.findByRole('tab', { name: 'Muut' })
    await act(async () => {
      await userEvent.click(othersTab)
    })
    await screen.findByRole('tabpanel', { name: 'Muut' })

    // Verify delete company button exists
    const deleteButton = screen.getByRole('button', { name: /poista kaikki tiedot/i })
    expect(deleteButton).toBeInTheDocument()

    // Click delete button
    await act(async () => {
      await userEvent.click(deleteButton)
    })

    // Verify confirmation dialog appears
    await screen.findByText('Poista yritys')
    await screen.findByText('Oletko varma, että haluat poistaa yrityksen? Kaikki tiedot poistetaan, eikä niitä voi palauttaa.')

    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /poista/i })
    await act(async () => {
      await userEvent.click(confirmButton)
    })

    // Verify API was called
    expect(mockedAxios.delete).toHaveBeenCalledWith('/tenants')
  })
})
