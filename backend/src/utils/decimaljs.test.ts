import Decimal from 'decimal.js'
import { describe, expect, it } from 'vitest'

describe('decimaljs', () => {
  it('should handle decimal rounding', () => {
    expect(new Decimal(123.120).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toString()).toBe('123.12')
    expect(new Decimal(123.121).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toString()).toBe('123.12')
    expect(new Decimal(123.132).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toString()).toBe('123.13')
    expect(new Decimal(123.123).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toString()).toBe('123.12')
    expect(new Decimal(123.124).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toString()).toBe('123.12')
    expect(new Decimal(123.125).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toString()).toBe('123.13')
    expect(new Decimal(123.126).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toString()).toBe('123.13')
    expect(new Decimal(123.127).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toString()).toBe('123.13')
    expect(new Decimal(123.128).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toString()).toBe('123.13')
    expect(new Decimal(123.129).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toString()).toBe('123.13')
    expect(new Decimal(123.130).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toString()).toBe('123.13')
  })
})
