import type { GetCurrentUserResponse } from '@siikli/shared'
import type { Mocked } from 'vitest'
import { act, screen } from '@testing-library/react'
import axios from 'axios'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppProvider } from '@/context/AppContext'
import { renderWithProviders } from '@/test/test-utils'
import { AuthProvider } from './context/AuthContext'
import MainApp from './index'

vi.mock('axios')
const mockedAxios = axios as Mocked<typeof axios>

function mockMatchMedia(isMobile = false) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: isMobile ? query.includes('767') : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

function mockCurrentUser() {
  return mockedAxios.get.mockImplementation((url) => {
    if (url === '/auth/current-user') {
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
}

async function renderMainApp() {
  await act(async () => {
    renderWithProviders(
      <AppProvider>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </AppProvider>,
      { route: '/orders' },
    )
  })
}

function assertNavigationLinks() {
  const ordersLink = screen.getByText('Orders')
  expect(ordersLink).toBeInTheDocument()

  const companySettingsLink = screen.getByText('My company')
  expect(companySettingsLink).toBeInTheDocument()

  const customersLink = screen.getByText('Customers')
  expect(customersLink).toBeInTheDocument()

  const logoutLink = screen.getByText('JD')
  expect(logoutLink).toBeInTheDocument()
}

describe('main app on desktop', () => {
  beforeAll(() => {
    mockMatchMedia()
  })

  beforeEach(() => {
    mockCurrentUser()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders main page', async () => {
    await renderMainApp()
    assertNavigationLinks()
  })
})

describe('main app mobile', () => {
  beforeAll(() => {
    mockMatchMedia(true)
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 767,
    })
  })

  beforeEach(() => {
    mockCurrentUser()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders main page', async () => {
    await renderMainApp()
    assertNavigationLinks()
  })
})
