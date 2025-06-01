import type { InvoiceItemDto } from '../frontend/src/types/types'
import { describe, expect, it } from 'vitest'
import { calculateTotals } from './services/invoice-service'

describe('calculateTotals', () => {
  const sampleItems: InvoiceItemDto[] = [
    {
      orderId: '1',
      orderNumber: 1,
      deliveryDate: new Date('2024-01-01'),
      productName: 'Test Product 1',
      amount: 100, // 100 kg
      price: 1.32, // Calculating using 1,32 €/kg, VAT 0 % price would be 1.158 €/kg
      price0: 1.16, // Calculating using 1,16 €/kg, VAT 14 % price would be 1.322 €/kg
    },
  ]

  it('calculates sums using VAT 14 % prices', () => {
    const result = calculateTotals(sampleItems, 0, false)

    expect(result.items.length).toBe(1)
    expect(result.items[0].usePrice0).toBe(false)
    expect(result.items[0].productName).toBe('Test Product 1')
    expect(result.items[0].quantity).toBe(100)
    expect(result.items[0].priceWithTax).toBeCloseTo(1.32)
    expect(result.items[0].priceWithoutTax).toBeUndefined()
    expect(result.items[0].totalWithTax).toBeCloseTo(132)
    expect(result.items[0].totalWithoutTax).toBeCloseTo(115.79)
    expect(result.items[0].tax).toBeCloseTo(16.21)

    expect(result.totals.totalSumWithTax).toBeCloseTo(132)
    expect(result.totals.totalSumWithoutTax).toBeCloseTo(115.79)
    expect(result.totals.totalTax).toBeCloseTo(16.21)
    expect(result.totals.finalSumWithTax).toBeCloseTo(132)
    expect(result.totals.finalSumWithoutTax).toBeCloseTo(115.79)
  })

  it('calculates sums using VAT 0 % prices', () => {
    const result = calculateTotals(sampleItems, 0, true)

    expect(result.items.length).toBe(1)
    expect(result.items[0].usePrice0).toBe(true)
    expect(result.items[0].productName).toBe('Test Product 1')
    expect(result.items[0].quantity).toBe(100)
    expect(result.items[0].priceWithTax).toBeUndefined()
    expect(result.items[0].priceWithoutTax).toBeCloseTo(1.16)
    expect(result.items[0].totalWithTax).toBeCloseTo(132.24)
    expect(result.items[0].totalWithoutTax).toBeCloseTo(116)
    expect(result.items[0].tax).toBeCloseTo(16.24)

    expect(result.totals.totalSumWithTax).toBeCloseTo(132.24)
    expect(result.totals.totalSumWithoutTax).toBeCloseTo(116)
    expect(result.totals.totalTax).toBeCloseTo(16.24)
    expect(result.totals.finalSumWithTax).toBeCloseTo(132.24)
    expect(result.totals.finalSumWithoutTax).toBeCloseTo(116)
  })
})