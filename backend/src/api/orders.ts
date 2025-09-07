import type {
  GetDownloadUrlResponse,
  GetOrderLimit,
  GetOrderResponse,
  GetOrdersResponse,
  IdAsBodyDto,
} from '@siikli/shared'
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import {
  CreateWaybillsRequest,
  GetOrdersQuery,
  IdParams,
  OrderStatus,
  parseIsoDate,
  PostCreateOrderRequest,
} from '@siikli/shared'
import express from 'express'
import { getSessionOrThrow, isAuthenticated } from '../middlewares/permissions'
import { rateLimitByUserAccount } from '../middlewares/rate-limit'
import prisma from '../prisma'
import { OrderService } from '../services/order-service'

export const ordersRoute = express.Router()
const s3 = new S3Client({ region: process.env.AWS_REGION })

ordersRoute.get(`/api/orders/limit`, isAuthenticated, rateLimitByUserAccount(20, 1), async (req, res) => {
  const { tenantId } = getSessionOrThrow(req)

  const remaining = await OrderService.getRemainingOrders(tenantId)
  return res.status(200).json({ remaining } satisfies GetOrderLimit)
})

ordersRoute.get(`/api/orders`, isAuthenticated, rateLimitByUserAccount(20, 1), async (req, res) => {
  const { tenantId } = getSessionOrThrow(req)
  const { startDate, endDate, status, customerId } = GetOrdersQuery.parse(req.query)

  const orders = await OrderService.getOrders(tenantId, parseIsoDate(startDate), parseIsoDate(endDate), status, customerId)

  res.json(orders satisfies GetOrdersResponse[])
})

ordersRoute.post(`/api/orders/waybills`, isAuthenticated, rateLimitByUserAccount(10, 1), async (req, res) => {
  const { tenantId } = getSessionOrThrow(req)
  const { startDate, endDate, customerId, preview } = CreateWaybillsRequest.parse(req.body)

  const pdfBuffer = await OrderService.getWaybillPdf(
    tenantId,
    startDate,
    endDate,
    customerId || null,
    preview,
  )

  // Set headers for proper PDF display
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Length', pdfBuffer.length)
  res.setHeader('Content-Disposition', 'inline')
  res.setHeader('Cache-Control', 'no-cache')
  res.status(200)
  res.end(pdfBuffer, 'binary')
})

ordersRoute.get(`/api/orders/:id/waybill`, isAuthenticated, rateLimitByUserAccount(20, 1), async (req, res) => {
  const { tenantId } = getSessionOrThrow(req)
  const { id } = IdParams.parse(req.params)

  // Look up invoice metadata in DB
  const order = await prisma.order.findUnique({ where: { id, tenantId } })
  if (!order?.waybillS3Key)
    return res.status(404).send('Not found')

  const cmd = new GetObjectCommand({
    Bucket: 'siikli-prod-files',
    Key: order.waybillS3Key,
  })

  const url = await getSignedUrl(s3, cmd, { expiresIn: 5 * 60 }) // 5 minutes
  res.json({ url } satisfies GetDownloadUrlResponse)
})

ordersRoute.get(`/api/orders/:id`, isAuthenticated, rateLimitByUserAccount(20, 1), async (req, res) => {
  const { tenantId } = getSessionOrThrow(req)
  console.log('/api/orders/:id')
  console.log(req.params)

  const { id } = IdParams.parse(req.params)

  const order = await OrderService.getOrder(id, tenantId)

  res.json(order satisfies GetOrderResponse)
})

ordersRoute.delete(`/api/orders/:id`, isAuthenticated, rateLimitByUserAccount(10, 1), async (req, res) => {
  const { tenantId } = getSessionOrThrow(req)
  const { id } = IdParams.parse(req.params)

  await OrderService.deleteOrder(id, tenantId)

  res.status(204).end()
})

ordersRoute.post(`/api/orders`, isAuthenticated, rateLimitByUserAccount(10, 1), async (req, res) => {
  const { tenantId } = getSessionOrThrow(req)
  const body = PostCreateOrderRequest.parse(req.body)

  const result = await OrderService.createOrder({
    ...body,
    tenantId,
    status: OrderStatus.WAITING_FOR_DELIVERY,
    deliveryDate: body.deliveryDate,
  })

  res.status(201).json({ id: result.id } satisfies IdAsBodyDto)
})

// TODO: Should be PUT
ordersRoute.post(`/api/orders/:id`, isAuthenticated, rateLimitByUserAccount(10, 1), async (req, res) => {
  const { tenantId, userId } = getSessionOrThrow(req)
  const data = PostCreateOrderRequest.parse(req.body)

  await OrderService.updateOrder({
    ...data,
    tenantId,
    status: data.status,
    userId,
    id: req.params.id,
    deliveryDate: data.deliveryDate,
  })

  res.status(204).end()
})
