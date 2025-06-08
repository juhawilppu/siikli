import type {
  GetOrderDto,
  GetOrderList,
  PostOrderRequestDto,
  PostOrderResponseDto,
} from '../../frontend/src/types/types'
import { endOfDay, parse, startOfDay } from 'date-fns'
import Decimal from 'decimal.js'
import express from 'express'
import puppeteer from 'puppeteer'
import { dateToString, formatDate, stringToDate } from '../../frontend/src/utils/date'
import { getUser, isAuthenticated } from '../middlewares/permissions'
import prisma from '../prisma'
import { createWaybills } from '../services/waybill'
import { serializeNumber } from '../utils/money'

async function verifyPackageSizeAndType(body: { packageType: string | null, packageSize: number | null }, tenantId: string) {
  console.log('checking type', body)

  if (body.packageType) {
    const packageType = await prisma.packageType.findFirst({
      where: {
        name: body.packageType,
        tenantId,
      },
    })
    if (!packageType) {
      console.log('creating package type', body.packageType)
      await prisma.packageType.create({
        data: {
          tenantId,
          name: body.packageType,
        },
      })
    }
    else {
      console.log('package type OK')
    }
  }

  if (body.packageSize) {
    const packageSize = await prisma.packageSize.findFirst({
      where: {
        size: body.packageSize,
        tenantId,
      },
    })
    if (!packageSize) {
      console.log('creating package size', body.packageSize)
      await prisma.packageSize.create({
        data: {
          tenantId,
          size: body.packageSize,
        },
      })
    }
    else {
      console.log('package size OK')
    }
  }
}

export const ordersRoute = express.Router()

ordersRoute.get(`/api/orders`, isAuthenticated, async (req, res) => {
  console.log('getting orders')

  if (!req.query.startDate || !req.query.endDate) {
    return res.status(400)
  }

  const startDate = stringToDate(req.query.startDate as string)
  const endDate = stringToDate(req.query.endDate as string)
  const { tenantId } = getUser(req)

  const result = await prisma.order.findMany({
    include: {
      customer: true,
      orderRows: true,
    },
    orderBy: [
      {
        deliveryDate: 'asc',
      },
      {
        customer: {
          name: 'asc',
        },
      },
    ],
    where: {
      deliveryDate: {
        gt: startOfDay(startDate),
        lte: endOfDay(endDate),
      },
      tenantId,
    },
  })
  const mapped = result.map((o) => {
    return {
      id: o.id,
      waybillNumber: o.waybillNumber,
      deliveryDate: formatDate(o.deliveryDate),
      total: o.orderRows.map(o => o.amount.mul(o.price)).reduce((a, b) => a.add(b), new Decimal(0)).toNumber(),
      customer: {
        id: o.customerId,
        name: o.customer.name,
      },
    } satisfies GetOrderList
  })
  res.json(mapped)
})

ordersRoute.get(`/api/orders/waybills`, isAuthenticated, async (req, res) => {
  console.log('getting orders')

  if (!req.query.startDate || !req.query.endDate) {
    return res.status(400)
  }

  const { tenantId } = getUser(req)

  console.log('startDate', startOfDay(parse(req.query.startDate as string, 'yyyy-MM-dd', new Date())))

  const orders = await prisma.order.findMany({
    include: {
      customer: true,
      orderRows: {
        include: {
          product: true,
        },
      },
    },
    orderBy: [
      {
        deliveryDate: 'asc',
      },

      {
        customer: {
          name: 'asc',
        },
      },
    ],
    where: {
      deliveryDate: {
        gte: startOfDay(parse(req.query.startDate as string, 'yyyy-MM-dd', new Date())),
        lte: endOfDay(parse(req.query.endDate as string, 'yyyy-MM-dd', new Date())),
      },
      tenantId,
    },
  })

  const company = await prisma.tenant.findFirstOrThrow({
    where: {
      id: tenantId,
    },
  })

  const document = await createWaybills(company, orders)

  console.log('creating pdf')
  console.log(document)
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox'],
  })
  const page = await browser.newPage()
  await page.setContent(document)

  const pdfBuffer = await page.pdf({
    format: 'a5',
    margin: {
      top: '5mm',
      right: '5mm',
      bottom: '5mm',
      left: '5mm',
    },
    displayHeaderFooter: true,
    footerTemplate: '<div style="height: 22mm;">moi</div>',
    printBackground: true,
  })

  await browser.close()

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

  const result = await prisma.order.findFirstOrThrow({
    include: {
      customer: true,
      orderRows: true,
    },
    orderBy: [
      {
        deliveryDate: 'asc',
      },
      {
        customer: {
          name: 'asc',
        },
      },
    ],
    where: {
      id: orderId,
      tenantId,
    },
  })

  res.json({
    id: result.id,
    deliveryDate: dateToString(result.deliveryDate),
    customerId: result.customerId,
    hasNote: result.hasNote,
    noteBody: result.noteBody,
    noteHeader: result.noteHeader,
    items: result.orderRows.map(p => (
      {
        id: p.id,
        productId: p.productId,
        price: serializeNumber(p.price),
        price0: serializeNumber(p.price0),
        amount: serializeNumber(p.amount),
        packages: p.amount.div(p.packageSize).toNumber(),
        packageSize: p.packageSize,
        packageType: p.packageType || '',
        freetext: p.freetext || '',
        createdAt: p.createdAt,
      }
    )),

  } satisfies GetOrderDto)
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
    await verifyPackageSizeAndType(item, tenantId)
  }

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
    await verifyPackageSizeAndType(item, tenantId)
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
