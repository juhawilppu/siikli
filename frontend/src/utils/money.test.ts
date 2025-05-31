import { expect, it } from 'vitest'
import { formatMoneyFi, formatNumber, formatPercentage } from './money'

it('formats money correctly', () => {
  expect(formatMoneyFi(2)).toBe('2,00 €')
  expect(formatMoneyFi(2.5)).toBe('2,50 €')
})

it('formats numbers correctly', () => {
  expect(formatNumber(2)).toBe('2,00')
  expect(formatNumber(2.5)).toBe('2,50')
  expect(formatNumber(2.55)).toBe('2,55')
  expect(formatNumber(2.555)).toBe('2,56')
  expect(formatNumber("2")).toBe('2,00')
  expect(formatNumber("2.5")).toBe('2,50')
  expect(formatNumber("2.59")).toBe('2,59')
})

it('formats percentage correctly', () => {
  expect(formatPercentage(2)).toBe('2,00 %')
  expect(formatPercentage(2.5)).toBe('2,50 %')
})
