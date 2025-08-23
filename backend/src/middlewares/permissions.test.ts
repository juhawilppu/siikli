import type { UserSessionFromPassport } from '../passportConfig'
import { describe, expect, it } from 'vitest'
import { getSessionOrThrow } from './permissions'

describe('permissions', () => {
  it('should return the correct user', () => {
    // Create a mock request object with a user property
    const mockReq = {
      user: { userId: '1', tenantId: '1', email: 'test@test.com', role: 'USER', tenantSignupCompleted: true } as UserSessionFromPassport,
    } as any
    const { userId, tenantId } = getSessionOrThrow(mockReq)
    expect(userId).toEqual('1')
    expect(tenantId).toEqual('1')
  })

  it('should throw an error if the user is not authenticated', () => {
    // Create a mock request object with a user property
    const mockReq = {
      user: null,
    } as any
    expect(() => getSessionOrThrow(mockReq)).toThrow('No tenant ID found')
  })
})
