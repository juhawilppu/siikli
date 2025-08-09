import { dateToIso } from '@siikli/shared'
import { Decimal } from 'decimal.js'
import { describe, expect, it } from 'vitest'
import { createInvoiceHtml } from './invoice-html'

describe('createInvoiceHtml', () => {
  it('should create a valid html invoice', () => {
    const invoice = createInvoiceHtml({
      invoiceId: 1,
      date: dateToIso(new Date()),
      dueDate: dateToIso(new Date()),
      customer: {
        streetAddress: 'Test Street',
        postalCode: '00100',
        city: 'Test City',
        name: 'Test Customer',
        legalName: 'Test Legal Name',
        businessId: '1234567890',
        showPriceWithoutTax: false,
        discount: new Decimal(0),
      },
      company: {
        name: 'Test Company',
        bankNumber: '1234567890',
        bankName: 'Test Bank',
        streetAddress: 'Test Street',
        postalCode: '00100',
        city: 'Test City',
        phone: '1234567890',
        email: 'test@test.com',
        website: 'https://test.com',
        businessId: '1234567890',
      },
      paymentCondition: 'Test Payment Condition',
      interestRate: 0,
      notificationPeriod: 'Test Notification Period',
      items: [],
      totals: {
        totalSumWithTax: new Decimal(100),
        finalSumWithTax: new Decimal(124),
        totalSumWithoutTax: new Decimal(100),
        finalSumWithoutTax: new Decimal(100),
        totalTax: new Decimal(100),
        totalKg: new Decimal(100),
        totalDiscount: new Decimal(0),
      },
    })
    expect(invoice).toContain('Test Company')
    expect(invoice).toContain('Test Legal Name')
    expect(invoice).toContain('Test Payment Condition')
    expect(invoice).toContain('Test Notification Period')
    expect(invoice).toContain('Test Street')
    expect(invoice).toContain('00100')
    expect(invoice).toContain('Test City')
    expect(invoice).toContain('124,00')
  })
})
