import { Decimal } from '@prisma/client/runtime/library'
import { describe, expect, it } from 'vitest'
import { formatNumber, serializeNumber } from './money'

describe('formatNumber', () => {
  it('should format a number', () => {
    expect(formatNumber(new Decimal(123))).toBe('123,00')
    expect(formatNumber(new Decimal(123.23))).toBe('123,23')
    expect(formatNumber(new Decimal(123.49))).toBe('123,49')
    expect(formatNumber(new Decimal(123.50))).toBe('123,50')
    expect(formatNumber(new Decimal(999.99))).toBe('999,99')
    expect(formatNumber(new Decimal(1234567.89))).toBe('1234567,89')
  })
})

it('serializes numbers correctly', () => {
  expect(serializeNumber(new Decimal(2.11))).toBe('2.11')
  expect(serializeNumber('2.555')).toBe('2.56')
})
