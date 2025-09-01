import { describe, expect, it } from 'vitest'
import { dateToIso, formatDate, isValidIsoDate, parseIsoDate } from './date'

describe('isValidIsoDate', () => {
  it('returns true for valid date', () => {
    expect(isValidIsoDate('2021-05-30')).toBe(true)
  })

  it('returns false for invalid date', () => {
    expect(isValidIsoDate('2021-05-30-1')).toBe(false)
  })
})

describe('dateToIso', () => {
  it('formats date correctly', () => {
    expect(dateToIso(new Date(2021, 4, 30))).toBe('2021-05-30')
  })

  it('formats start of year correctly', () => {
    expect(dateToIso(new Date(2021, 0, 1))).toBe('2021-01-01')
  })

  it('formats end of year correctly', () => {
    expect(dateToIso(new Date(2021, 11, 31))).toBe('2021-12-31')
  })
})

describe('parseIsoDate', () => {
  it('parses string correctly', () => {
    expect(parseIsoDate('2021-05-30')).toEqual(new Date(Date.UTC(2021, 4, 30)))
  })

  it('parses leap day correctly', () => {
    expect(parseIsoDate('2020-02-29')).toEqual(new Date(Date.UTC(2020, 1, 29)))
  })

  it('throws on wrong format (slashes)', () => {
    expect(() => parseIsoDate('2021/05/30')).toThrow('Invalid date format')
  })

  it('throws on wrong format (missing leading zero)', () => {
    expect(() => parseIsoDate('2021-5-30')).toThrow('Invalid date format')
  })

  it('throws on completely invalid string', () => {
    expect(() => parseIsoDate('not-a-date')).toThrow('Invalid date format')
  })

  it('throws on invalid month (e.g., 13)', () => {
    expect(() => parseIsoDate('2021-13-01')).toThrow('Invalid month')
  })

  it('throws on invalid day (e.g., 32)', () => {
    expect(() => parseIsoDate('2021-12-32')).toThrow('Invalid day')
  })
})

describe('dateToIso and parseIsoDate', () => {
  it('should keep data unchanged over roundtrip', () => {
    expect(dateToIso(parseIsoDate('2021-05-30'))).toBe('2021-05-30')
  })
})

describe('formatDate', () => {
  it('pretty prints date correctly', () => {
    expect(formatDate(new Date(2021, 4, 30))).toBe('30.5.2021')
  })
})
