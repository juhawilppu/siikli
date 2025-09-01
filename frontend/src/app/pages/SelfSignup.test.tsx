import type { Mocked } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from 'axios'
import { afterEach, beforeAll, beforeEach, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import SelfSignup from './SelfSignup'

vi.mock('axios')
const mockedAxios = axios as Mocked<typeof axios>

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
  mockedAxios.post.mockResolvedValue({ data: {} })
})

afterEach(() => {
  vi.clearAllMocks()
})

it('renders self signup page', async () => {
  renderWithProviders(<SelfSignup />)
  expect(await screen.findByRole('heading', { name: 'Tervetuloa Siikliin!', level: 1 })).toBeInTheDocument()
  expect(screen.getByText('Lisätään yrityksesi tiedot.')).toBeInTheDocument()
})

it('allows entering company details and submitting', async () => {
  const user = userEvent.setup()
  renderWithProviders(<SelfSignup />)

  // Fill in company name
  const companyNameInput = screen.getByLabelText(/Yrityksen nimi/i)
  await user.type(companyNameInput, 'Test Company Oy')

  // Toggle marketing consent
  const marketingCheckbox = screen.getByLabelText(/Haluan vastaanottaa tietoa Siiklin uusista ominaisuuksista ja päivityksistä/i)
  await user.click(marketingCheckbox)

  // Submit form
  const submitButton = screen.getByRole('button', { name: /Jatka/i })
  await user.click(submitButton)

  expect(mockedAxios.post).toHaveBeenCalledWith('/tenants/complete-signup', {
    name: 'Test Company Oy',
    user: {
      marketingConsent: true,
    },
  })
})

it('disables submit button when company name is empty', async () => {
  renderWithProviders(<SelfSignup />)

  const submitButton = screen.getByRole('button', { name: /Jatka/i })
  expect(submitButton).toBeDisabled()
})

it('shows loading state while submitting', async () => {
  const user = userEvent.setup()
  mockedAxios.post.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

  renderWithProviders(<SelfSignup />)

  const companyNameInput = screen.getByLabelText(/Yrityksen nimi/i)
  await user.type(companyNameInput, 'Test Company Oy')

  const submitButton = screen.getByRole('button', { name: /Jatka/i })
  await user.click(submitButton)

  expect(screen.getByText('Ladataan...')).toBeInTheDocument()
})
