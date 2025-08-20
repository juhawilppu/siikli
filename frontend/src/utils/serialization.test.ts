import { describe, expect, it } from 'vitest'
import { serializeNumber } from './serialization'

describe('serializeNumber (frontend)', () => {
  it('should serialize a number with a dot', () => {
    expect(serializeNumber('1,23')).toBe('1.23')
    expect(serializeNumber('1 200,23')).toBe('1200.23')
    expect(serializeNumber('1 200 000,23')).toBe('1200000.23')
  })
})
