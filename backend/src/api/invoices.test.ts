import { randomUUID } from 'node:crypto'
import { OrderStatus } from '@siikli/shared'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { createApp } from '../app'
import redisClient from '../redis'
import { CustomerFactory } from '../test/factories/customer-factory'
import { InvoiceFactory } from '../test/factories/invoice-factory'
import { OrderFactory } from '../test/factories/order-factory'
import { ProductFactory } from '../test/factories/product-factory'
import { WaybillFactory } from '../test/factories/waybill-service'

// Mock uploadPdfToS3 in upload-to-s3.ts
vi.mock('../utils/upload-to-s3', () => {
  return {
    uploadPdfToS3: vi.fn().mockResolvedValue({
      key: 'mock-key',
      md5b64: 'mock-md5',
      sha256b64: 'mock-sha256',
      url: 'https://mock-s3-url.com/mock-key',
    }),
  }
})

describe('/api/invoices', () => {
  let agent: request.SuperAgentTest
  let createdCustomerId: string
  let createdProductId: string
  let createdOrderId: string

  beforeAll(async () => {
    const app = await createApp()
    agent = request.agent(app)
    await agent
      .post('/api/auth/email/check-pin')
      .send({ email: 'test-invoices@example.com', pinCode: '123456' })
      .expect(302)
  })

  afterAll(async () => {
    await redisClient.quit()
  })

  it('should create an order', async () => {
    createdCustomerId = await CustomerFactory.createCustomer(agent, {
      name: 'J-Store',
      companyLegalName: null,
      discount: null,
      invoiceReference: null,
      streetAddress: null,
      postalCode: null,
      city: null,
      email: null,
      phone: null,
      businessId: null,
    })
    expect(createdCustomerId).toBeTruthy()

    createdProductId = await ProductFactory.createProduct(agent, { name: 'Sieglinde, simple' })
    expect(createdProductId).toBeTruthy()

    const res = await OrderFactory.createOrder(agent, {
      customerId: createdCustomerId,
      deliveryDate: '2025-08-23',
      status: OrderStatus.WAITING_FOR_DELIVERY,
      hasNote: false,
      noteBody: '',
      noteHeader: '',
      items: [
        {
          id: randomUUID(),
          productId: createdProductId,
          amount: '1',
          price: '10.00',
          packages: 1,
          packageSize: 1,
          packageType: 'Box',
          freetext: 'Test freetext',
        },
      ],
    })
    createdOrderId = res.id
    expect(createdOrderId).toBeTruthy()

    await OrderFactory.getOrder(agent, createdOrderId)

    const waybill = await WaybillFactory
      .createWaybill(agent, {
        startDate: '2025-08-23',
        endDate: '2025-08-23',
        preview: false,
      })
    expect(waybill.body).toBeTruthy()

    await agent.post('/api/tenants').send({
      name: 'Test Tenant',
      businessId: '123456',
      streetAddress: 'Test Street',
      postalCode: '12345',
      city: 'Test City',
      invoiceBankName: 'Test Bank', // <-- Add these because invoice will fail without it
      invoiceBankAccount: '123456', // <-- Add these because invoice will fail without it
      invoiceSumRow: 'Test Sum Row',
      phone: '123456',
      email: 'test-tenants@example.com',
      website: 'https://test-tenants.com',
    })

    const invoice = await InvoiceFactory.createInvoice(agent, {
      startDate: '2025-08-23',
      endDate: '2025-08-23',
      customerId: createdCustomerId,
    })
    expect(invoice.body).toBeTruthy()
  })
})
