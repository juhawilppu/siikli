import { vi } from 'vitest'

vi.mock('../services/email-service', async () => {
  return {
    sendEventEmail: vi.fn().mockResolvedValue(undefined),
    sendEmail: vi.fn().mockResolvedValue(undefined),
  }
})
