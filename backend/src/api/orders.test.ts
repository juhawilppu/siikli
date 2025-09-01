import type { GetOrderResponse } from '@siikli/shared'
import { OrderStatus } from '@siikli/shared'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createApp } from '../app'
import redisClient from '../redis'
import { CustomerFactory } from '../test/factories/customer-factory'
import { OrderFactory } from '../test/factories/order-factory'
import { ProductFactory } from '../test/factories/product-factory'

describe('/api/orders', () => {
  let agent: request.SuperAgentTest
  let createdCustomerId: string
  let createdProductId: string
  let createdOrderId: string
  let order: GetOrderResponse

  beforeAll(async () => {
    const app = await createApp()
    agent = request.agent(app)
    await agent
      .post('/api/auth/email/check-pin')
      .send({ email: 'test-orders@example.com', pinCode: '123456' })
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
    order = await OrderFactory.getOrder(agent, createdOrderId)
    expect(order.id).toBe(createdOrderId)
    expect(order.customerId).toBe(createdCustomerId)
    expect(order.deliveryDate).toBe('2025-08-23')
    expect(order.status).toBe(OrderStatus.WAITING_FOR_DELIVERY)
    expect(order.items[0].productId).toBe(createdProductId)
    expect(order.items[0].amount).toBe('1')
    expect(order.items[0].price).toBe('10')
    expect(order.items[0].packages).toBe(1)
    expect(order.items[0].packageSize).toBe(1)
    expect(order.items[0].packageType).toBe('Box')
    expect(order.items[0].freetext).toBe('Test freetext')
  })

  it('should update an order', async () => {
    await OrderFactory.updateOrder(agent, createdOrderId, {
      customerId: order.customerId,
      status: OrderStatus.DELIVERED,
      deliveryDate: '2025-08-24',
      hasNote: false,
      noteBody: '',
      noteHeader: '',
      items: order.items.map(item => ({
        id: item.id,
        productId: item.productId,
        amount: item.amount,
        price: item.price,
        packages: item.packages,
        packageSize: item.packageSize,
        packageType: item.packageType,
        freetext: item.freetext,
        deleted: true,
      })),
    })
    const fetchedOrder = await OrderFactory.getOrder(agent, createdOrderId)
    expect(fetchedOrder.status).toBe(OrderStatus.DELIVERED)
    expect(fetchedOrder.deliveryDate).toBe('2025-08-24')
    expect(fetchedOrder.customerId).toBe(createdCustomerId)
    expect(fetchedOrder.hasNote).toBe(false)
    expect(fetchedOrder.noteBody).toBe('')
    expect(fetchedOrder.noteHeader).toBe('')
    expect(fetchedOrder.items.length).toBe(0)
  })

  it('should get orders', async () => {
    const orders = await OrderFactory.getOrders(agent, '2025-08-23', '2025-08-25')
    expect(orders.length).toBe(1)
    expect(orders[0].id).toBe(createdOrderId)
    expect(orders[0].customer.id).toBe(createdCustomerId)
    expect(orders[0].deliveryDate).toBe('2025-08-24')
  })

  it('should return order limit', async () => {
    const limit = await OrderFactory.getGetOrderLimit(agent)
    expect(limit).toBe(10000)
  })

  it('should delete an order', async () => {
    await OrderFactory.deleteOrder(agent, createdOrderId)
    const orders = await OrderFactory.getOrders(agent, '2025-08-23', '2025-08-25')
    expect(orders.length).toBe(0)
  })
})
