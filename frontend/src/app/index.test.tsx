import type { GetCurrentUserResponse } from '@siikli/shared'
import type { Mocked } from 'vitest'
import { act, screen } from '@testing-library/react'
import axios from 'axios'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppProvider } from '@/context/AppContext'
import { renderWithProviders } from '@/test/test-utils'
import { AuthProvider } from './context/AuthContext'
import MainApp from './index'

// Mock axios as before
vi.mock('axios')
const mockedAxios = axios as Mocked<typeof axios>

describe('main app', () => {
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
      console.log('mockedAxios.get called with url', url)
      if (url === '/auth/current-user') {
        console.log('current-user called')
        return Promise.resolve({
          data: {
            authenticated: true,
            signupCompleted: true,
            userId: '123',
            tenantId: '123',
            initials: 'JD',
            email: 'john.doe@example.com',
            role: 'OWNER',
          } satisfies GetCurrentUserResponse,
        })
      }
      return Promise.resolve({ data: [] })
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders company settings', async () => {
    await act(async () => {
      renderWithProviders(
        <AppProvider>
          <AuthProvider>
            <MainApp />
          </AuthProvider>
        </AppProvider>,
        { route: '/app/orders' },
      )
    })

    const ordersLink = screen.getByText('Tilaukset')
    expect(ordersLink).toBeInTheDocument()

    const companySettingsLink = screen.getByText('Oma yritys')
    expect(companySettingsLink).toBeInTheDocument()

    const customersLink = screen.getByText('Asiakkaat')
    expect(customersLink).toBeInTheDocument()

    const logoutLink = screen.getByText('JD')
    expect(logoutLink).toBeInTheDocument()
  })
})
