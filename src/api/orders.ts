import { PrismaClient } from '@prisma/client'
import express from 'express'
import moment from 'moment'
import {
  GetOrderList,
  PostOrderDto,
  PostOrderIdDto,
} from '../../frontend/src/types/types'

export const ordersRoute = express.Router()
const prisma = new PrismaClient()

ordersRoute.get(`/api/orders`, async (req, res) => {
  console.log('getting orders')

  if (!req.user) {
    return res.status(403)
  }

  if (!req.query.startDate || !req.query.endDate) {
    return res.status(400)
  }

  const result = await prisma.order.findMany({
    include: {
      customer: true,
      products: true,
    },
    orderBy: [
      {
        deliveryDate: 'asc',
      },

      {
        customer: {
          order_index: 'asc',
        },
      },
    ],
    where: {
      deliveryDate: {
        gte: moment(req.query.startDate as string, 'YYYY-MM-DD').toDate(),
        lte: moment(req.query.endDate as string, 'YYYY-MM-DD').toDate(),
      },
      tenantId: parseTenantId(req),
    },
  })
  const mapped = result.map((o) => {
    return {
      id: o.id,
      deliveryDate: moment(o.deliveryDate).format('YYYY-MM-DD'),
      customer: {
        id: o.customerId,
        chain: o.customer.chain,
        name: o.customer.name,
      },
    } as GetOrderList
  })
  res.json(mapped)
})

const getOrder = async (id: number, tenantId: number) => {
  const result = await prisma.order.findFirst({
    include: {
      customer: true,
      products: true,
    },
    orderBy: [
      {
        deliveryDate: 'asc',
      },
      {
        customer: {
          order_index: 'asc',
        },
      },
    ],
    where: {
      id: id,
      tenantId: tenantId,
    },
  })
  return result
}

ordersRoute.get(`/api/orders/:id`, async (req, res) => {
  console.log('getting order ' + req.params.id)
  res.json(
    await getOrder(parseInt(req.params.id as string), parseTenantId(req))
  )
})

export const parseTenantId = (req: any) => req.user.tenantId

ordersRoute.post(`/api/orders`, async (req, res) => {
  console.log('getting orders')

  const data = req.body as PostOrderDto

  const result = await prisma.order.create({
    data: {
      deliveryDate: moment(data.deliveryDate, 'YYYY-MM-DD').toDate(),
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
          id: parseTenantId(req),
        },
      },
    },
  })
  const result2 = await prisma.orderProduct.createMany({
    data: data.rows.map((r) => {
      return {
        orderId: result.id,
        productId: r.productId,

        amount: r.amount,
        price: r.price,
        freetext: r.freetext,
        packageSize: r.packageSize,
        packageType: r.packageType,
      }
    }),
  })

  res.json({ ...result, rows: result2 })
})

ordersRoute.post(`/api/orders/:id`, async (req, res) => {
  console.log('getting orders')

  const data = req.body as PostOrderIdDto

  const result = await prisma.order.update({
    data: {
      deliveryDate: moment(data.deliveryDate, 'YYYY-MM-DD').toDate(),
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
          id: parseTenantId(req),
        },
      },
    },
    where: {
      id: parseInt(req.params.id as string),
    },
  })
  console.log(data.rows)
  const toCreate = data.rows.filter((r) => !r.id)
  if (toCreate.length > 0) {
    await prisma.orderProduct.createMany({
      data: toCreate.map((r) => {
        return {
          orderId: result.id,
          productId: r.productId,
          amount: r.amount,
          price: r.price,
          freetext: r.freetext,
          packageSize: r.packageSize,
          packageType: r.packageType,
        }
      }),
    })
  }
  const toUpdate = data.rows.filter((r) => r.id)
  if (toUpdate.length > 0) {
    const promises = toUpdate.map((r) => {
      console.log(r)
      return prisma.orderProduct.update({
        data: {
          orderId: result.id,
          productId: r.productId,
          amount: r.amount,
          price: r.price,
          freetext: r.freetext,
          packageSize: r.packageSize,
          packageType: r.packageType,
        },
        where: {
          id: r.id as number,
        },
      })
    })
    await Promise.all(promises)
  }

  res.json(
    await getOrder(parseInt(req.params.id as string), parseTenantId(req))
  )
})
