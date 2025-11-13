import type { GetOnboardingResponse } from '@siikli/shared'
import type { Mocked } from 'vitest'
import { screen } from '@testing-library/react'
import axios from 'axios'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/test-utils'
import OnboardingPage from './Onboarding'

vi.mock('axios')
const mockedAxios = axios as Mocked<typeof axios>

beforeEach(() => {
  mockedAxios.get.mockImplementation((url) => {
    if (url === '/tenants/onboarding') {
      return Promise.resolve({
        data: {
          productCreated: true,
          customerCreated: true,
          orderCreated: true,
          invoiceCreated: true,
          waybillCreated: false,
          bankInformationSet: false,
        } satisfies GetOnboardingResponse,
      })
    }
    return Promise.resolve({ data: [] })
  })
})

afterEach(() => {
  vi.clearAllMocks()
})

it('renders Onboarding page', async () => {
  renderWithProviders(<OnboardingPage />)
  expect(await screen.findByText('Let’s get started with Siikli!')).toBeInTheDocument()

  expect(await screen.findByText('4/6 completed')).toBeInTheDocument()
  expect(await screen.findByText('1. Create product')).toBeInTheDocument()
  expect(await screen.findByText('2. Create customer')).toBeInTheDocument()
  expect(await screen.findByText('3. Create order')).toBeInTheDocument()
  expect(await screen.findByText('4. Print waybill')).toBeInTheDocument()
  expect(await screen.findByText('5. Add billing information')).toBeInTheDocument()
  expect(await screen.findByText('6. Print invoice')).toBeInTheDocument()
})
