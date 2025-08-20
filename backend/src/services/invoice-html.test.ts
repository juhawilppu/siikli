import { dateToIso } from '@siikli/shared'
import { Decimal } from 'decimal.js'
import { describe, expect, it } from 'vitest'
import { createInvoiceHtml } from './invoice-html'

const invoiceData = {
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
    invoiceSumRow: 'Potatoes etc. as per waybill',
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
    finalTax: new Decimal(100),
    totalKg: new Decimal(100),
    totalDiscountWithoutTax: new Decimal(0),
    totalDiscountWithTax: new Decimal(0),
  },
}

describe('createInvoiceHtml', () => {
  it('should create a valid html invoice', () => {
    const invoice = createInvoiceHtml(invoiceData)
    expect(invoice).toContain('Test Company')
    expect(invoice).toContain('Test Legal Name')
    expect(invoice).toContain('Test Payment Condition')
    expect(invoice).toContain('Test Notification Period')
    expect(invoice).toContain('Potatoes etc. as per waybill')
    expect(invoice).toContain('Test Street')
    expect(invoice).toContain('00100')
    expect(invoice).toContain('Test City')
    expect(invoice).toContain('124,00')
  })

  it('should create a valid html invoice with no nulls', () => {
    const invoice = createInvoiceHtml({
      ...invoiceData,
      customer: {
        ...invoiceData.customer,
        streetAddress: null,
        postalCode: null,
        city: null,
      },
      company: {
        ...invoiceData.company,
        streetAddress: null,
        postalCode: null,
        phone: null,
      },
    })

    // Should not contain nulls
    expect(invoice).not.toContain('null')
    expect(invoice).not.toContain('Y-tunnus:')

    // Should contain something
    expect(invoice).toContain('Test Bank')
    expect(invoice).toContain('1234567890')
    expect(invoice).toContain('124,00')
  })

  it('should create a valid html invoice with discount', () => {
    const invoice = createInvoiceHtml({
      ...invoiceData,
      totals: {
        ...invoiceData.totals,
        totalDiscountWithoutTax: new Decimal(11.23),
        totalDiscountWithTax: new Decimal(12.80),
      },
    })

    expect(invoice).toContain('&ndash;11,23')
  })
})
