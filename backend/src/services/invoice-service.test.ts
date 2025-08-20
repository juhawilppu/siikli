import type { InvoiceItemDto } from './invoice-service'
import { Decimal } from '@prisma/client/runtime/library'
import { describe, expect, it } from 'vitest'
import { calculateTotals } from './invoice-service'

describe('calculateTotals', () => {
  it('calculates sums for a single item', () => {
    const sampleItems: InvoiceItemDto[] = [
      {
        id: '1',
        orderId: '1',
        orderNumber: 1,
        deliveryDate: new Date('2024-01-01'),
        productName: 'Test Product 1',
        amount: new Decimal(100),
        price: new Decimal(1.32),
      },
    ]
    const result = calculateTotals(sampleItems, new Decimal(0))

    expect(result.items.length).toBe(1)
    expect(result.items[0].productName).toBe('Test Product 1')
    expect(result.items[0].quantity).toBeCloseTo(100)
    expect(result.items[0].priceWithoutTax).toBeCloseTo(1.32)
    expect(result.items[0].totalWithTax).toBeCloseTo(150.48)
    expect(result.items[0].totalWithoutTax).toBeCloseTo(132)
    expect(result.items[0].tax).toBeCloseTo(18.48)

    expect(result.totals.totalSumWithTax).toBeCloseTo(150.48)
    expect(result.totals.totalSumWithoutTax).toBeCloseTo(132)
    expect(result.totals.totalDiscountWithoutTax).toBeCloseTo(0)
    expect(result.totals.totalDiscountWithTax).toBeCloseTo(0)

    expect(result.totals.finalSumWithTax).toBeCloseTo(150.48)
    expect(result.totals.finalSumWithoutTax).toBeCloseTo(132)
    expect(result.totals.finalTax).toBeCloseTo(18.48)
  })

  it('calculates totals correctly with multiple items', () => {
    const sampleItems: InvoiceItemDto[] = [
      {
        id: '1',
        orderId: '1',
        orderNumber: 1,
        deliveryDate: new Date('2024-01-01'),
        productName: 'Product A',
        amount: new Decimal(10),
        price: new Decimal(1.32),
      },
      {
        id: '2',
        orderId: '2',
        orderNumber: 2,
        deliveryDate: new Date('2024-01-01'),
        productName: 'Product B',
        amount: new Decimal(5),
        price: new Decimal(2.28),
      },
    ]

    const result = calculateTotals(sampleItems, new Decimal(0))

    expect(result.items.length).toBe(2)

    const [row1, row2] = result.items

    expect(row1.productName).toBe('Product A')
    expect(row1.quantity).toBeCloseTo(10)
    expect(row1.totalWithoutTax).toBeCloseTo(13.20)
    expect(row1.totalWithTax).toBeCloseTo(15.05)
    expect(row1.tax).toBeCloseTo(1.85)

    expect(row2.productName).toBe('Product B')
    expect(row2.quantity).toBeCloseTo(5)
    expect(row2.totalWithoutTax).toBeCloseTo(11.40)
    expect(row2.totalWithTax).toBeCloseTo(13.00)
    expect(row2.tax).toBeCloseTo(1.60)

    expect(result.totals.totalSumWithoutTax).toBeCloseTo(24.60)
    expect(result.totals.totalSumWithTax).toBeCloseTo(28.05)

    expect(result.totals.finalSumWithoutTax).toBeCloseTo(24.60)
    expect(result.totals.finalSumWithTax).toBeCloseTo(28.05)

    expect(result.totals.finalTax).toBeCloseTo(3.45)
  })

  it('applies discount correctly', () => {
    const sampleItems: InvoiceItemDto[] = [
      {
        id: '1',
        orderId: '1',
        orderNumber: 1,
        deliveryDate: new Date('2024-01-01'),
        productName: 'Product A',
        amount: new Decimal(10),
        price: new Decimal(1.32),
      },
      {
        id: '2',
        orderId: '2',
        orderNumber: 2,
        deliveryDate: new Date('2024-01-01'),
        productName: 'Product B',
        amount: new Decimal(5),
        price: new Decimal(2.28),
      },
    ]

    const result = calculateTotals(sampleItems, new Decimal(10))

    expect(result.items.length).toBe(2)

    expect(result.totals.totalSumWithoutTax.toNumber()).toBeCloseTo(24.60)
    expect(result.totals.totalSumWithTax.toNumber()).toBeCloseTo(28.05)

    expect(result.totals.totalDiscountWithoutTax.toNumber()).toBeCloseTo(2.46)
    expect(result.totals.totalDiscountWithTax.toNumber()).toBeCloseTo(2.80)

    expect(result.totals.finalSumWithoutTax.toNumber()).toBeCloseTo(22.14)
    expect(result.totals.finalSumWithTax.toNumber()).toBeCloseTo(25.25)

    expect(result.totals.finalTax.toNumber()).toBeCloseTo(3.11)
  })
})
