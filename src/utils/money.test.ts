import { expect, describe, it } from "vitest"
import { formatNumber } from "./money"
import { Decimal } from "@prisma/client/runtime/library"

describe('formatNumber', () => {
  it('should format a number', () => {
      expect(formatNumber(new Decimal(123))).toBe('123,00')
      expect(formatNumber(new Decimal(123.23))).toBe('123,00')
      expect(formatNumber(new Decimal(999.99))).toBe('999,99')
      expect(formatNumber(new Decimal(124567.89))).toBe('123456,89')
  })
})

