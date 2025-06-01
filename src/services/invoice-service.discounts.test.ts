import { describe, expect, it } from 'vitest'
import { calculateTotals, InvoiceItemDto } from './invoice-service'
import { Decimal } from '@prisma/client/runtime/library'

describe('calculateTotals', () => {
    it('applies discount correctly when using VAT 14 % prices', () => {
        const sampleItems: InvoiceItemDto[] = [
          {
            id: '1',
            orderId: '1',
            orderNumber: 1,
            deliveryDate: new Date('2024-01-01'),
            productName: 'Product A',
            amount: new Decimal(10),
            price: new Decimal(1.32),  // ALV 14 % sisältävä hinta
            price0: new Decimal(1.16)  // ALV 0 % hinta (ei käytetä)
          },
          {
            id: '2',
            orderId: '2',
            orderNumber: 2,
            deliveryDate: new Date('2024-01-01'),
            productName: 'Product B',
            amount: new Decimal(5),
            price: new Decimal(2.28),  // ALV 14 % sisältävä hinta
            price0: new Decimal(2.00)
          },
        ]
      
        const result = calculateTotals(sampleItems, new Decimal(10), false)
      
        // Ensin lasketaan kuten aiemmassa testissä (ilman alennusta):
        // Veroton A: 11.58 €
        // Veroton B: 10.00 €
        // Veroton yhteensä: 21.58 €
      
        // Alennus: 21.58 × 0.10 = 2.16 €
        // Uusi veroton summa: 21.58 - 2.16 = 19.42 €
        // ALV: 19.42 × 0.14 = 2.72 €
        // Loppusumma verollisena: 19.42 + 2.72 = 22.14 €
      
        expect(result.totals.totalSumWithoutTax).toBeCloseTo(21.58)
        expect(result.totals.totalDiscount).toBeCloseTo(2.16)
        expect(result.totals.finalSumWithoutTax).toBeCloseTo(19.42)
        expect(result.totals.totalTax).toBeCloseTo(2.72)
        expect(result.totals.finalSumWithTax).toBeCloseTo(22.14)
      })

      it('applies discount correctly when using VAT 0 % prices', () => {
        const sampleItems: InvoiceItemDto[] = [
          {
            id: '1',
            orderId: '1',
            orderNumber: 1,
            deliveryDate: new Date('2024-01-01'),
            productName: 'Product A',
            amount: new Decimal(10),
            price: new Decimal(1.32),  // ALV 14 % hinta (ei käytetä)
            price0: new Decimal(1.16)  // ALV 0 % hinta
          },
          {
            id: '2',
            orderId: '2',
            orderNumber: 2,
            deliveryDate: new Date('2024-01-01'),
            productName: 'Product B',
            amount: new Decimal(5),
            price: new Decimal(2.28),  // ALV 14 % hinta (ei käytetä)
            price0: new Decimal(2.00)  // ALV 0 % hinta
          },
        ]
      
        const result = calculateTotals(sampleItems, new Decimal(10), true)
      
        // Product A: 10 × 1.16 = 11.60 €
        // Product B: 5 × 2.00 = 10.00 €
        // Veroton yhteensä: 21.60 €
        // Alennus: 21.60 × 0.10 = 2.16 €
        // Alennettu veroton: 19.44 €
        // ALV 14 %: 19.44 × 0.14 = 2.72 €
        // Verollinen: 19.44 + 2.72 = 22.16 €
      
        expect(result.totals.totalSumWithoutTax).toBeCloseTo(21.60)
        expect(result.totals.totalDiscount).toBeCloseTo(2.16)
        expect(result.totals.finalSumWithoutTax).toBeCloseTo(19.44)
        expect(result.totals.totalTax).toBeCloseTo(2.72)
        expect(result.totals.finalSumWithTax).toBeCloseTo(22.16)
      })
      

  
})