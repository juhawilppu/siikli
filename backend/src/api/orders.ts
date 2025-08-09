import type {
  GetOrderDto,
  GetOrderList,
  PostOrderRequestDto,
  PostOrderResponseDto,
} from '@siikli/shared'
import { parseIsoDate } from '@siikli/shared'
import { Decimal } from 'decimal.js'
import express from 'express'
import { getUser, isAuthenticated } from '../middlewares/permissions'
import { OrderService } from '../services/order-service'

export const ordersRoute = express.Router()

export interface GetOrderLimitResponseDto {
  remaining: number
}

ordersRoute.get(`/api/orders/limit`, isAuthenticated, async (req, res) => {
  const { tenantId } = getUser(req)
  const remaining = await OrderService.getRemainingOrders(tenantId)
  return res.status(200).json({ remaining })
})

ordersRoute.get(`/api/orders`, isAuthenticated, async (req, res) => {
  console.log('getting orders')

  if (!req.query.startDate || !req.query.endDate) {
    return res.status(400)
  }

  const startDate = parseIsoDate(req.query.startDate as string)
  const endDate = parseIsoDate(req.query.endDate as string)
  const { tenantId } = getUser(req)

  const orders = await OrderService.getOrders(tenantId, startDate, endDate)

  res.json(orders satisfies GetOrderList[])
})

ordersRoute.get(`/api/orders/waybills`, isAuthenticated, async (req, res) => {
  console.log('getting orders')

  if (!req.query.startDate || !req.query.endDate) {
    return res.status(400)
  }

  const { tenantId } = getUser(req)

  const pdfBuffer = await OrderService.getWaybillPdf(tenantId, req.query.startDate as string, req.query.endDate as string)

  console.log('pdfBuffer', pdfBuffer)

  // Set headers for proper PDF display
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Length', pdfBuffer.length)
  res.setHeader('Content-Disposition', 'inline')
  res.setHeader('Cache-Control', 'no-cache')
  res.status(200)
  res.end(pdfBuffer, 'binary')
})

ordersRoute.get(`/api/orders/:id`, isAuthenticated, async (req, res) => {
  console.log(`getting order ${req.params.id}`)

  const orderId = req.params.id
  const { tenantId } = getUser(req)

  const order = await OrderService.getOrder(orderId, tenantId)

  res.json(order satisfies GetOrderDto)
})

ordersRoute.delete(`/api/orders/:id`, isAuthenticated, async (req, res) => {
  console.log(`deleting order ${req.params.id}`)

  const orderId = req.params.id
  const { tenantId } = getUser(req)

  await OrderService.deleteOrder(orderId, tenantId)

  res.status(200).json({ message: 'Order deleted' })
})

ordersRoute.post(`/api/orders`, isAuthenticated, async (req, res) => {
  console.log('saving order')

  const data = req.body as PostOrderRequestDto
  const { tenantId } = getUser(req)

  const result = await OrderService.createOrder({
    ...data,
    tenantId,
    deliveryDate: data.deliveryDate,
    items: data.items.map(item => ({
      ...item,
      price: new Decimal(item.price),
      price0: new Decimal(item.price0),
      amount: new Decimal(item.amount),
    })),
  })

  res.json({ id: result.id } satisfies PostOrderResponseDto)
})

ordersRoute.post(`/api/orders/:id`, isAuthenticated, async (req, res) => {
  console.log(`saving order ${req.params.id}`)

  const data = req.body as PostOrderRequestDto
  const { tenantId, userId } = getUser(req)

  await OrderService.updateOrder({
    ...data,
    tenantId,
    userId,
    id: req.params.id,
    deliveryDate: data.deliveryDate,
    items: data.items.map(item => ({
      ...item,
      price: new Decimal(item.price),
      price0: new Decimal(item.price0),
      amount: new Decimal(item.amount),
    })),
  })

  res.status(200).json({ message: 'Saved' })
})
