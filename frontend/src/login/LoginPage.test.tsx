import type { GetCurrentUserResponse } from '@siikli/shared'
import type { Mocked } from 'vitest'
import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from 'axios'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '@/app/context/AuthContext'
import { AppProvider } from '@/context/AppContext'
import { renderWithProviders } from '@/test/test-utils'
import LoginPage from './LoginPage'

// Mock axios
vi.mock('axios')
const mockedAxios = axios as Mocked<typeof axios>

describe('loginPage', () => {
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

    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: '' },
    })
  })

  beforeEach(() => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url === '/auth/current-user') {
        return Promise.resolve({
          data: {
            authenticated: true,
            userId: '123',
            email: 'john.doe@example.com',
            tenantId: '123',
            initials: 'JD',
            role: 'OWNER',
            signupCompleted: true,
          } satisfies GetCurrentUserResponse,
        })
      }
      return Promise.resolve({ data: ['kakka'] })
    })
    mockedAxios.post.mockResolvedValue({ data: {} })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('allows logging in with Google', async () => {
    const user = userEvent.setup()

    await act(async () => {
      renderWithProviders(
        <AppProvider>
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        </AppProvider>,
      )
    })

    // Check initial render
    expect(screen.getByRole('heading', { name: 'Login to Siikli' })).toBeInTheDocument()

    // Click Google login button
    const googleButton = screen.getByRole('button', { name: 'Login with Google' })
    await user.click(googleButton)

    // Even though the button is clicked above, for some reason (bug in testing-library?),
    // we need to dispatch the submit event manually
    const form = googleButton.closest('form')
    expect(form).toBeDefined()
    form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

    // Verify window.location.href was set to Google auth endpoint
    expect(window.location.href).toBe('/api/auth/google')
  })

  it('allows entering email and pin code', async () => {
    const user = userEvent.setup()

    await act(async () => {
      renderWithProviders(
        <AppProvider>
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        </AppProvider>,
      )
    })

    // Check initial render
    expect(screen.getByRole('heading', { name: 'Login to Siikli' })).toBeInTheDocument()
    // Click email login tab
    const emailLoginTab = screen.getByRole('tab', { name: 'Login with email' })
    await user.click(emailLoginTab)

    // Enter email
    const emailInput = screen.getByRole('textbox')
    await user.type(emailInput, 'test@example.com')

    // Submit email form
    await act(async () => {
      const sendButton = screen.getByRole('button', { name: 'Send PIN code' })
      await user.click(sendButton)

      // Even though the button is clicked above, for some reason (bug in testing-library?),
      // we need to dispatch the submit event manually
      const form = sendButton.closest('form')
      expect(form).toBeDefined()
      form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    })

    // Verify pin code request
    expect(mockedAxios.post).toHaveBeenCalledWith('/auth/email/create-pin', {
      email: 'test@example.com',
    })

    // Enter pin code
    const pinInputs = screen.getAllByRole('textbox')
    expect(pinInputs).toHaveLength(6)

    // Type pin code one digit at a time
    for (let i = 0; i < 6; i++) {
      await user.type(pinInputs[i], String(i + 1))
      // Verify the value was entered
      expect(pinInputs[i]).toHaveValue(String(i + 1))
    }

    // Submit pin code form
    await act(async () => {
      const form = pinInputs[0].closest('form')
      expect(form).toBeDefined()
      form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    })

    // Verify pin code request
    expect(mockedAxios.post).toHaveBeenCalledWith('/auth/email/check-pin', {
      email: 'test@example.com',
      pinCode: '123456',
    })
  })
})
