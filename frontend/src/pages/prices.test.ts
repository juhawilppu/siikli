import { describe, expect, it } from 'vitest'
import { calculatePricesFromVat0, calculatePricesFromVat14 } from './NewProduct'

describe('price calculation functions', () => {
  describe('calculatePricesFromVat14', () => {
    it('should calculate VAT 14 % price correctly without touching user input', () => {
      const result = calculatePricesFromVat14('114', false)
      expect(result.price).toBe('114') // User has written "114", but we don't want to touch it while they are still writing
      expect(result.price0).toBe('100.00')
    })

    it('should calculate VAT 14 % price correctly and format to 2 decimal places', () => {
      const result = calculatePricesFromVat14('114', true)
      expect(result.price).toBe('114.00') // User has written "114", so we want to format it to a proper price, using 2 decimal places
      expect(result.price0).toBe('100.00')
    })

    it('should handle decimal inputs', () => {
      const result = calculatePricesFromVat14('10.50', true)
      expect(result.price).toBe('10.50') // Formatting does not affect since it's already formatted
      expect(result.price0).toBe('9.21')
    })
  })

  describe('calculatePricesFromVat0', () => {
    it('should calculate VAT 0 % price correctly without touching user input', () => {
      const result = calculatePricesFromVat0('100', false)
      expect(result.price).toBe('114.00') // User has written "100", but we don't want to touch it while they are still writing
      expect(result.price0).toBe('100')
    })

    it('should calculate VAT 0 % price correctly and format to 2 decimal places', () => {
      const result = calculatePricesFromVat0('100', true)
      expect(result.price).toBe('114.00')
      expect(result.price0).toBe('100.00') // User has written "100", so we want to format it to a proper price, using 2 decimal places
    })

    it('should handle decimal inputs', () => {
      const result = calculatePricesFromVat0('9.21', true)
      expect(result.price).toBe('10.50')
      expect(result.price0).toBe('9.21') // Formatting does not affect since it's already formatted
    })
  })
})
