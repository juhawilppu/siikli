import { expect, it } from 'vitest'
import { formatNumber, formatPercentage, parseToNumber } from './money'

it('formats numbers correctly', () => {
  expect(formatNumber(2)).toBe('2,00')
  expect(formatNumber(2.5)).toBe('2,50')
  expect(formatNumber(2.55)).toBe('2,55')
  expect(formatNumber(2.555)).toBe('2,56')
  expect(formatNumber('2')).toBe('2,00')
  expect(formatNumber('2.5')).toBe('2,50')
  expect(formatNumber('2.59')).toBe('2,59')
  expect(formatNumber('35000')).toBe('35 000,00')
})

it('formats percentage correctly', () => {
  expect(formatPercentage(2)).toBe('2,00 %')
  expect(formatPercentage(2.5)).toBe('2,50 %')
})

it('parses numbers correctly', () => {
  expect(parseToNumber('2')).toBe(2)
  expect(parseToNumber('2.5')).toBe(2.5)
  expect(parseToNumber('2.59')).toBe(2.59)
  expect(parseToNumber('35000')).toBe(35000)
  expect(parseToNumber(35000)).toBe(35000)
  expect(parseToNumber('35 000.00')).toBe(35000)
})
