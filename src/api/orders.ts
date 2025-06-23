import type {
  GetOrderDto,
  GetOrderList,
  PostOrderRequestDto,
  PostOrderResponseDto,
} from '../../frontend/src/types/types'
import express from 'express'
import { dateToString, stringToDate } from '../../frontend/src/utils/date'
import { getUser, isAuthenticated } from '../middlewares/permissions'
import prisma from '../prisma'
import { OrderService } from '../services/order-service'
import { TenantService } from '../services/tenant-service'
import { serializeNumber } from '../utils/money'

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

  const startDate = stringToDate(req.query.startDate as string)
  const endDate = stringToDate(req.query.endDate as string)
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

  await prisma.order.delete({
    where: {
      id: orderId,
      tenantId,
    },
  })

  res.status(200).json({ message: 'Order deleted' })
})

ordersRoute.post(`/api/orders`, isAuthenticated, async (req, res) => {
  console.log('saving order')

  const data = req.body as PostOrderRequestDto
  const { tenantId, userId } = getUser(req)

  for (const item of data.items) {
    await TenantService.verifyPackageSizeAndType(item.packageType, item.packageSize, tenantId)
  }

  // TODO: If free user, check order limit

  const waybillNumberResult = await prisma.order.findFirst({
    where: {
      tenantId,
    },
    orderBy: {
      waybillNumber: 'desc',
    },
    select: {
      waybillNumber: true,
    },
  })
  const waybillNumber = waybillNumberResult && waybillNumberResult.waybillNumber ? waybillNumberResult.waybillNumber + 1 : 1000

  const result = await prisma.order.create({
    data: {
      waybillNumber,
      deliveryDate: stringToDate(data.deliveryDate),
      hasNote: data.hasNote,
      noteHeader: data.hasNote ? data.noteHeader : undefined,
      noteBody: data.hasNote ? data.noteBody : undefined,
      showPriceWithoutTax: false,
      customer: {
        connect: {
          id: data.customerId,
        },
      },
      tenant: {
        connect: {
          id: tenantId,
        },
      },
    },
  })
  await prisma.orderRow.createMany({
    data: data.items.map((r) => {
      return {
        orderId: result.id,
        tenantId,
        productId: r.productId,
        amount: r.amount,
        price: r.price,
        price0: r.price0,
        freetext: r.freetext,
        packageSize: r.packageSize,
        packageType: r.packageType,
      }
    }),
  })

  await prisma.log.create({
    data: {
      userId,
      tenantId,
      event: 'create_order',
      data: {
        order: result.id,
        customer: result.customerId,
      },
    },
  })
  res.json({ id: result.id } satisfies PostOrderResponseDto)
})

ordersRoute.post(`/api/orders/:id`, isAuthenticated, async (req, res) => {
  console.log(`saving order ${req.params.id}`)

  const data = req.body as PostOrderRequestDto
  const { tenantId, userId } = getUser(req)

  for (const item of data.items) {
    await TenantService.verifyPackageSizeAndType(item.packageType, item.packageSize, tenantId)
  }
  const result = await prisma.order.update({
    data: {
      deliveryDate: stringToDate(data.deliveryDate),
      hasNote: data.hasNote,
      noteHeader: data.hasNote ? data.noteHeader : undefined,
      noteBody: data.hasNote ? data.noteBody : undefined,
      showPriceWithoutTax: false,
      customer: {
        connect: {
          id: data.customerId,
        },
      },
      tenant: {
        connect: {
          id: tenantId,
        },
      },
    },
    where: {
      id: req.params.id as string,
      tenantId,
    },
  })
  console.log(data.items)
  const toCreate = data.items.filter(r => !r.id)
  if (toCreate.length > 0) {
    await prisma.orderRow.createMany({
      data: toCreate.map((r) => {
        return {
          orderId: result.id,
          tenantId,
          productId: r.productId,
          amount: r.amount,
          price: r.price || 0,
          price0: r.price0 || 0,
          freetext: r.freetext,
          packageSize: r.packageSize,
          packageType: r.packageType,
        }
      }),
    })
  }
  const toUpdate = data.items.filter(r => r.id)
  if (toUpdate.length > 0) {
    const promises = toUpdate.map((r) => {
      console.log(r)
      return prisma.orderRow.update({
        data: {
          orderId: result.id,
          productId: r.productId,
          amount: r.amount,
          price: r.price || 0,
          price0: r.price0 || 0,
          freetext: r.freetext,
          packageSize: r.packageSize,
          packageType: r.packageType,
        },
        where: {
          id: r.id as string,
          orderId: result.id,
        },
      })
    })

    const promises2 = toUpdate.filter(r => r.deleted).map((r) => {
      return prisma.orderRow.delete({
        where: {
          id: r.id as string,
          orderId: result.id,
        },
      })
    })
    await Promise.all([...promises, ...promises2])
  }

  await prisma.log.create({
    data: {
      userId,
      tenantId,
      event: 'update_order',
      data: {
        order: result.id,
        customer: result.customerId,
      },
    },
  })

  res.status(200).json({ message: 'Saved' })
})
