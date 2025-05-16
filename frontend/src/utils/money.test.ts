import { expect, it } from 'vitest'
import { formatMoneyFi } from './money'

it('returns 0 for empty input', () => {
  expect(formatMoneyFi(2)).toBe('2,00 €')
  expect(formatMoneyFi(2.5)).toBe('2,50 €')
})
