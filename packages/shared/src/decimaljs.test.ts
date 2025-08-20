import Decimal from 'decimal.js'
import { describe, expect, it } from 'vitest'

// Tests to make sure decimaljs works as expected
describe('decimaljs', () => {
  // Sanity checks to make sure rounding is done correctly
  it('should handle decimal rounding using ROUND_HALF_UP', () => {
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

    expect(new Decimal(1.005).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toString()).toBe('1.01')
  })

  it('should handle classic floating point problems', () => {
    expect(new Decimal(0.1).add(new Decimal(0.2)).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toString()).toBe('0.3')
    expect(new Decimal(1000000.1).add(new Decimal(0.2)).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toString()).toBe('1000000.3')
    expect(new Decimal(-1.005).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toString()).toBe('-1.01')
    expect(new Decimal(-1.004).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toFixed(2)).toBe('-1.00')

    const vat = new Decimal(24.60).mul(0.14).toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
    expect(vat.toString()).toBe('3.44')

    const val = new Decimal(1).div(49).mul(49)
    expect(val.toDecimalPlaces(2).toFixed(2)).toBe('1.00')

    const ratio = new Decimal(0.3).div(0.1)
    expect(ratio.toString()).toBe('3')
  })
})
