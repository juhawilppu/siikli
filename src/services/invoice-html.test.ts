import { describe, expect, it } from "vitest";
import { createInvoiceHtml } from "./invoice-html";
import { Decimal } from "decimal.js";

describe('createInvoiceHtml', () => {
  it('should create a valid html invoice', () => {
    const invoice = createInvoiceHtml({
      invoiceId: 1,
      date: new Date().toISOString(),
      dueDate: new Date().toISOString(),
      customer: {
        streetAddress: 'Test Street',
        postalCode: '00100',
        city: 'Test City',
        name: 'Test Customer',
        legalName: 'Test Legal Name',
        businessId: '1234567890',
        showPriceWithoutTax: false,
        discount: new Decimal(0)
      },
      company: {
        name: 'Test Company',
        bankNumber: '1234567890',
        bankName: 'Test Bank'
      },
      paymentCondition: 'Test Payment Condition',
      interestRate: 0,
      notificationPeriod: 'Test Notification Period',
      items: [],
      totals: {
        totalSumWithTax: new Decimal(100),
        finalSumWithTax: new Decimal(100),
        totalSumWithoutTax: new Decimal(100),
        finalSumWithoutTax: new Decimal(100),
        totalTax: new Decimal(100),
        totalKg: new Decimal(100),
        totalDiscount: new Decimal(0)
      },
    })
    expect(invoice).toContain('LASKU FAKTURA')
    expect(invoice).toContain('Test Company')
    expect(invoice).toContain('Test Customer')
    expect(invoice).toContain('Test Payment Condition')
    expect(invoice).toContain('Test Notification Period')
    expect(invoice).toContain('Test Street')
    expect(invoice).toContain('00100')
    expect(invoice).toContain('Test City')
  })
})  