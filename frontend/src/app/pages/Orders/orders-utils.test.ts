import type { OrderItem } from './OrderForm'
import { describe, expect, it } from 'vitest'
import { calculateTotal } from './orders-utils'

describe('orders-utils', () => {
  it('should calculate total', () => {
    const orderItems = [{ amount: '10', price: '1.20' }] as OrderItem[]
    expect(calculateTotal(orderItems).toNumber()).toBeCloseTo(12)
  })
})
