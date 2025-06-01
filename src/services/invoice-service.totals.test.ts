import { describe, expect, it } from 'vitest'
import { calculateTotals, InvoiceItemDto } from './invoice-service'
import { Decimal } from '@prisma/client/runtime/library'

describe('calculateTotals', () => {
  it('calculates totals correctly with multiple items using VAT 0 % prices', () => {
    const sampleItems: InvoiceItemDto[] = [
      {
        id: '1',
        orderId: '1',
        orderNumber: 1,
        deliveryDate: new Date('2024-01-01'),
        productName: 'Product A',
        amount: new Decimal(10),
        price: new Decimal(1.32), // ALV 14 % hinta (ei käytetä tässä)
        price0: new Decimal(1.16) // ALV 0 % hinta käytössä
      },
      {
        id: '2',
        orderId: '2',
        orderNumber: 2,
        deliveryDate: new Date('2024-01-01'),
        productName: 'Product B',
        amount: new Decimal(5),
        price: new Decimal(2.28), // ALV 14 % hinta
        price0: new Decimal(2.00) // ALV 0 % hinta käytössä
      },
    ]
  
    const result = calculateTotals(sampleItems, new Decimal(0), true)
  
    // Product A: 10 × 1.16 = 11.60 (veroton), ALV = 1.62, verollinen = 13.22
    // Product B: 5 × 2.00 = 10.00 (veroton), ALV = 1.40, verollinen = 11.40
    // Kokonaisveroton: 11.60 + 10.00 = 21.60
    // ALV yhteensä: 1.62 + 1.40 = 3.02
    // Verollinen: 13.22 + 11.40 = 24.62
  
    expect(result.items.length).toBe(2)
  
    const [row1, row2] = result.items
  
    expect(row1.productName).toBe('Product A')
    expect(row1.quantity).toBeCloseTo(10)
    expect(row1.totalWithoutTax).toBeCloseTo(11.60)
    expect(row1.totalWithTax).toBeCloseTo(13.22)
    expect(row1.tax).toBeCloseTo(1.62)
  
    expect(row2.productName).toBe('Product B')
    expect(row2.quantity).toBeCloseTo(5)
    expect(row2.totalWithoutTax).toBeCloseTo(10.00)
    expect(row2.totalWithTax).toBeCloseTo(11.40)
    expect(row2.tax).toBeCloseTo(1.40)
  
    expect(result.totals.totalSumWithoutTax).toBeCloseTo(21.60)
    expect(result.totals.totalTax).toBeCloseTo(3.02)
    expect(result.totals.totalSumWithTax).toBeCloseTo(24.62)
  })

  it('calculates totals correctly with multiple items using VAT 14 % prices', () => {
    const sampleItems: InvoiceItemDto[] = [
      {
        id: '1',
        orderId: '1',
        orderNumber: 1,
        deliveryDate: new Date('2024-01-01'),
        productName: 'Product A',
        amount: new Decimal(10),
        price: new Decimal(1.32),   // ALV 14 % hinta
        price0: new Decimal(1.16)   // ALV 0 % hinta (ei käytetä tässä)
      },
      {
        id: '2',
        orderId: '2',
        orderNumber: 2,
        deliveryDate: new Date('2024-01-01'),
        productName: 'Product B',
        amount: new Decimal(5),
        price: new Decimal(2.28),   // ALV 14 % hinta
        price0: new Decimal(2.00)   // ALV 0 % hinta (ei käytetä tässä)
      },
    ]
  
    const result = calculateTotals(sampleItems, new Decimal(0), false)
  
    // Product A: 10 × 1.32 = 13.20 (verollinen), veroton = 11.58, ALV = 1.62
    // Product B: 5 × 2.28 = 11.40 (verollinen), veroton = 10.00, ALV = 1.40
    // Veroton yhteensä: 11.58 + 10.00 = 21.58
    // ALV yhteensä: 1.62 + 1.40 = 3.02
    // Verollinen yhteensä: 13.20 + 11.40 = 24.60
  
    expect(result.items.length).toBe(2)
  
    const [row1, row2] = result.items
  
    expect(row1.productName).toBe('Product A')
    expect(row1.quantity).toBeCloseTo(10)
    expect(row1.totalWithTax).toBeCloseTo(13.20)
    expect(row1.totalWithoutTax).toBeCloseTo(11.58)
    expect(row1.tax).toBeCloseTo(1.62)
  
    expect(row2.productName).toBe('Product B')
    expect(row2.quantity).toBeCloseTo(5)
    expect(row2.totalWithTax).toBeCloseTo(11.40)
    expect(row2.totalWithoutTax).toBeCloseTo(10.00)
    expect(row2.tax).toBeCloseTo(1.40)
  
    expect(result.totals.totalSumWithTax).toBeCloseTo(24.60)
    expect(result.totals.totalSumWithoutTax).toBeCloseTo(21.58)
    expect(result.totals.totalTax).toBeCloseTo(3.02)
  })
  
})