import { expect, it } from 'vitest'
import { formatMoneyFi, formatPercentage } from './money'

it('formats money correctly', () => {
  expect(formatMoneyFi(2)).toBe('2,00 €')
  expect(formatMoneyFi(2.5)).toBe('2,50 €')
})

it('formats percentage correctly', () => {
  expect(formatPercentage(2)).toBe('2,00 %')
  expect(formatPercentage(2.5)).toBe('2,50 %')
})
