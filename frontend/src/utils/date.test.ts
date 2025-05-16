import { expect, it } from 'vitest'
import { dateToString, formatDate } from './date'

it('formats date correctly', () => {
  expect(dateToString(new Date(2021, 0, 1))).toBe('2021-01-01')
})

it('parses date correctly', () => {
  // expect(stringToDate('2021-01-01')).toBe(new Date(2021, 0, 1))
})

it('pretty prints date correctly', () => {
  expect(formatDate(new Date(2021, 0, 1))).toBe('1.1.2021')
})
