import type {
  GetOrderDto,
  GetOrderListDto,
  PostOrderRequestDto,
  PostOrderResponseDto,
} from '@siikli/shared'
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { OrderStatus, parseIsoDate } from '@siikli/shared'
import { Decimal } from 'decimal.js'
import express from 'express'
import { getSessionOrThrow, isAuthenticated } from '../middlewares/permissions'
import prisma from '../prisma'
import { OrderService } from '../services/order-service'

export const ordersRoute = express.Router()
const s3 = new S3Client({ region: process.env.AWS_REGION })

export interface GetOrderLimitResponseDto {
  remaining: number
}

ordersRoute.get(`/api/orders/limit`, isAuthenticated, async (req, res) => {
  const { tenantId } = getSessionOrThrow(req)

  const remaining = await OrderService.getRemainingOrders(tenantId)
  return res.status(200).json({ remaining })
})

ordersRoute.get(`/api/orders`, isAuthenticated, async (req, res) => {
  const { tenantId, userId } = getSessionOrThrow(req)

  console.log('get orders')
  console.log('userId', userId)

  if (!req.query.startDate || !req.query.endDate) {
    return res.status(400)
  }

  const startDate = parseIsoDate(req.query.startDate as string)
  const endDate = parseIsoDate(req.query.endDate as string)
  const status = req.query.status as OrderStatus | undefined
  const customerId = req.query.customerId as string | undefined

  const orders = await OrderService.getOrders(tenantId, startDate, endDate, status, customerId)

  res.json(orders satisfies GetOrderListDto[])
})

ordersRoute.get(`/api/orders/waybills`, isAuthenticated, async (req, res) => {
  const { tenantId } = getSessionOrThrow(req)

  if (!req.query.startDate || !req.query.endDate) {
    return res.status(400)
  }

  const preview = req.query.preview === 'true'

  const pdfBuffer = await OrderService.getWaybillPdf(tenantId, req.query.startDate as string, req.query.endDate as string, req.query.customerId as string | null, preview)

  console.log('pdfBuffer', pdfBuffer)

  // Set headers for proper PDF display
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Length', pdfBuffer.length)
  res.setHeader('Content-Disposition', 'inline')
  res.setHeader('Cache-Control', 'no-cache')
  res.status(200)
  res.end(pdfBuffer, 'binary')
})

ordersRoute.get(`/api/orders/:id/waybill`, isAuthenticated, async (req, res) => {
  const { tenantId } = getSessionOrThrow(req)

  const orderId = req.params.id
  // Look up invoice metadata in DB
  const order = await prisma.order.findUnique({ where: { id: orderId, tenantId } })
  if (!order?.waybillS3Key)
    return res.status(404).send('Not found')

  const cmd = new GetObjectCommand({
    Bucket: 'siikli-prod-files',
    Key: order.waybillS3Key,
  })

  const url = await getSignedUrl(s3, cmd, { expiresIn: 5 * 60 }) // 5 minutes
  res.json({ url })
})

ordersRoute.get(`/api/orders/:id`, isAuthenticated, async (req, res) => {
  const { tenantId } = getSessionOrThrow(req)

  const orderId = req.params.id

  const order = await OrderService.getOrder(orderId, tenantId)

  res.json(order satisfies GetOrderDto)
})

ordersRoute.delete(`/api/orders/:id`, isAuthenticated, async (req, res) => {
  const { tenantId } = getSessionOrThrow(req)

  const orderId = req.params.id

  await OrderService.deleteOrder(orderId, tenantId)

  res.status(200).json({ message: 'Order deleted' })
})

ordersRoute.post(`/api/orders`, isAuthenticated, async (req, res) => {
  console.log('saving order')

  const data = req.body as PostOrderRequestDto
  const { tenantId } = getSessionOrThrow(req)

  const result = await OrderService.createOrder({
    ...data,
    tenantId,
    status: OrderStatus.WAITING_FOR_DELIVERY,
    deliveryDate: data.deliveryDate,
    items: data.items.map(item => ({
      ...item,
      price: new Decimal(item.price),
      amount: new Decimal(item.amount),
    })),
  })

  res.status(201).json({ id: result.id } satisfies PostOrderResponseDto)
})

// TODO: Should be PUT
ordersRoute.post(`/api/orders/:id`, isAuthenticated, async (req, res) => {
  const { tenantId, userId } = getSessionOrThrow(req)

  const data = req.body as PostOrderRequestDto

  await OrderService.updateOrder({
    ...data,
    tenantId,
    status: data.status,
    userId,
    id: req.params.id,
    deliveryDate: data.deliveryDate,
    items: data.items.map(item => ({
      ...item,
      price: new Decimal(item.price),
      amount: new Decimal(item.amount),
    })),
  })

  res.status(200).json({ message: 'Saved' })
})
