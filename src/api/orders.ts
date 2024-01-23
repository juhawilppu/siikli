import { PrismaClient } from '@prisma/client'
import express from 'express'
import moment from 'moment'
import { GetOrderList, PostOrderDto } from '../../frontend/src/types/types'

export const ordersRoute = express.Router()
const prisma = new PrismaClient()

ordersRoute.get(`/api/orders`, async (req, res) => {
  console.log('getting orders')

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

ordersRoute.get(`/api/orders/:id`, async (req, res) => {
  console.log('getting order ' + req.params.id)

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
      id: parseInt(req.params.id),
    },
  })
  res.json(result)
})

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
