import { describe, expect, it } from 'vitest'
import { AuthService } from './auth-service'

describe('authService', () => {
  describe('parseInitials', () => {
    it('should return first two segments of email', () => {
      expect(AuthService.parseInitials('johndoe@example.com')).toBe('JO')
      expect(AuthService.parseInitials('john.doe@example.com')).toBe('JD')
    })
  })
})
