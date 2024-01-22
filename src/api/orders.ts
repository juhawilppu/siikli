import { PrismaClient } from '@prisma/client'
import express from 'express'
import moment from 'moment'
import { GetOrderList, PostOrderDto } from '../../frontend/src/types/types'

export const ordersRoute = express.Router()
const prisma = new PrismaClient()

ordersRoute.get(`/api/orders`, async (req, res) => {
  console.log('getting orders')
  const result = await prisma.order.findMany({
    include: {
      customer: true,
    },
    orderBy: [
      {
        delivery_date: 'desc',
      },
      {
        customer: {
          chain: 'asc',
        },
      },
      {
        customer: {
          name: 'asc',
        },
      },
    ],
  })
  const mapped = result.map((o) => {
    return {
      id: o.id,
      deliveryDate: moment(o.delivery_date).format('YYYY-MM-DD'),
      customer: {
        id: o.customer_id,
        chain: o.customer.chain,
        name: o.customer.name,
      },
    } as GetOrderList
  })
  res.json(mapped)
})

ordersRoute.post(`/api/orders`, async (req, res) => {
  console.log('getting orders')

  const data = req.body as PostOrderDto

  const result = await prisma.order.create({
    data: {
      delivery_date: moment(data.deliveryDate, 'YYYY-MM-DD').toDate(),
      has_note: data.hasNote,
      note_header: data.hasNote ? data.noteHeader : undefined,
      note_body: data.hasNote ? data.noteBody : undefined,
      show_price_without_tax: false,
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
        order_id: result.id,
        product_id: r.productId,

        amount: r.amount,
        price: r.price,
        freetext: r.freetext,
        package_size: r.packageSize,
        package_type: r.packageType,
      }
    }),
  })
  res.json({ ...result, rows: result2 })
})
