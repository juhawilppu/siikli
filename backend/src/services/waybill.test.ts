import { OrderStatus } from '@prisma/client'
import { Decimal } from 'decimal.js'
import { describe, expect, it } from 'vitest'
import createWaybill from './waybill'

const testData = {
  tenant: {
    id: '1',
    name: 'Test Company',
    streetAddress: 'Test Street 1',
    postalCode: '00100',
    city: 'Helsinki',
    businessId: '1234567-8',
    phone: '1234567890',
    email: 'test@test.com',
    website: 'https://test.com',
    invoiceBankName: 'Test Bank',
    invoiceBankAccount: '1234567890',
    invoiceBankBic: 'TESTFIHH',
    invoiceReference: '1234567890',
    invoiceSumRow: 'wat',
    invoiceSwiftBic: 'TESTFIHH',
    signupCompleted: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    subscriptionType: 'free',
    subscriptionStartDate: new Date(),
    subscriptionEndDate: new Date(),
    trialEndDate: new Date(),
    trialDaysLeft: 10,
    trialDays: 10,
  },
  order: {
    id: '1',
    orderNumber: 1,
    customerId: '1',
    deliveryDate: new Date('2024-01-15'),
    noteHeader: 'Test Note Header',
    noteBody: 'Test Note Body',
    customer: {
      id: '1',
      name: 'Test Customer',
      companyLegalName: 'Test Customer',
      discount: new Decimal(0),
      invoiceReference: '1234567890',
      email: 'test@test.com',
      phone: '1234567890',
      streetAddress: 'Test Street 1',
      postalCode: '00100',
      city: 'Helsinki',
      businessId: '1234567-8',
      showPriceWithoutTax: false,
      tenantId: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    hasNote: true,
    showPriceWithoutTax: false,
    tenantId: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    waybillS3Key: null,
    invoiceId: null,
    status: OrderStatus.WAITING_FOR_DELIVERY,
    orderRows: [
      {
        id: '1',
        orderId: '1',
        tenantId: '1',
        productId: '1',
        amount: new Decimal(2),
        price: new Decimal(10),
        price0: new Decimal(8.77),
        packageSize: 1,
        freetext: null,
        packageType: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        product: {
          id: '1',
          tenantId: '1',
          name: 'Test Product',
          variety: null,
          info: null,
          price: null,
          type: null,
          subtype: null,
          packageSize: null,
          packageType: null,
          price0: null,
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      {
        id: '2',
        orderId: '1',
        tenantId: '1',
        productId: '2',
        amount: new Decimal(1),
        price: new Decimal(-5),
        price0: new Decimal(-5),
        packageSize: 1,
        freetext: null,
        packageType: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        product: {
          id: '2',
          tenantId: '1',
          name: 'Discount Product',
          variety: null,
          info: null,
          price: null,
          type: null,
          subtype: null,
          packageSize: null,
          packageType: null,
          price0: null,
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    ],
  },
}

describe('createWaybill', () => {
  it('should generate correct HTML content', async () => {
    const { tenant, order } = testData
    const html = await createWaybill(tenant, order, true)

    // Verify company details
    expect(html).toContain('Test Company')
    expect(html).toContain('Test Street 1')
    expect(html).toContain('00100 Helsinki')
    expect(html).toContain('Y-tunnus: 1234567-8')
    expect(html).not.toContain('null')

    // Verify order details
    expect(html).toContain('Test Customer')
    expect(html).toContain('15.1.2024')

    // Verify products
    expect(html).toContain('Test Product')
    expect(html).toContain('Discount Product (Hyvitys)')
    expect(html).toContain('Kilohinta (€/kg/kpl)<br>sis. ALV 14 %')
    expect(html).toContain('20,00')
    expect(html).toContain('Kokonaishinta (€)<br>sis. ALV 14 %')

    // Verify note
    expect(html).toContain('Test Note Header')
    expect(html).toContain('Test Note Body')

    // Verify signature section exists
    expect(html).toContain('____&nbsp;&nbsp;/&nbsp;&nbsp;____&nbsp;&nbsp;/&nbsp;&nbsp;20______')
  })

  it('should generate correct HTML content without VAT', async () => {
    const { tenant, order } = {
      ...testData,
      order: { ...testData.order, customer: { ...testData.order.customer, showPriceWithoutTax: true } },
    }

    const html = await createWaybill(tenant, order, false)

    // Verify VAT 0 % price is used (2 x 8.77)
    expect(html).toContain('Kilohinta (€/kg/kpl)<br>ALV 0 %')
    expect(html).toContain('17,54')
    expect(html).toContain('Kokonaishinta (€)<br>ALV 0 %')
  })

  it('should not show nulls in waybill', async () => {
    const tenant = {
      id: '1',
      name: 'Test Company',
      streetAddress: null,
      postalCode: null,
      city: null,
      businessId: null,
      phone: null,
      email: null,
      website: null,
      invoiceBankName: null,
      invoiceBankAccount: null,
      invoiceBankBic: null,
      invoiceReference: null,
      invoiceSumRow: null,
      invoiceSwiftBic: null,
      signupCompleted: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      subscriptionType: 'free',
      subscriptionStartDate: new Date(),
      subscriptionEndDate: new Date(),
      trialEndDate: new Date(),
      trialDaysLeft: 10,
      trialDays: 10,
    }

    const order = {
      id: '1',
      orderNumber: 1,
      customerId: '1',
      deliveryDate: new Date('2024-01-15'),
      hasNote: false,
      noteHeader: null,
      noteBody: null,
      customer: {
        id: '1',
        name: 'Test Customer',
        companyLegalName: null,
        discount: new Decimal(0),
        invoiceReference: null,
        email: null,
        phone: null,
        streetAddress: null,
        postalCode: null,
        city: null,
        businessId: null,
        showPriceWithoutTax: false,
        tenantId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      showPriceWithoutTax: false,
      tenantId: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      waybillS3Key: null,
      invoiceId: null,
      status: OrderStatus.WAITING_FOR_DELIVERY,
      orderRows: [
        {
          id: '1',
          orderId: '1',
          tenantId: '1',
          productId: '1',
          amount: new Decimal(2),
          price: new Decimal(10),
          price0: new Decimal(10),
          packageSize: 1,
          freetext: null,
          packageType: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          product: {
            id: '1',
            tenantId: '1',
            name: 'Test Product',
            variety: null,
            info: null,
            price: null,
            type: null,
            subtype: null,
            packageSize: null,
            packageType: null,
            price0: null,
            active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      ],
    }

    const html = await createWaybill(tenant, order, true)

    // Verify no nulls in waybill
    expect(html).not.toContain('null')
    expect(html).not.toContain('Y-tunnus:')
  })
})
