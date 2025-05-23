import type {
  GetOrderDto,
  GetOrderList,
  PostOrderRequestDto,
  PostOrderResponseDto,
} from '../../frontend/src/types/types'
import { captureException } from '@sentry/node'
import { endOfDay, parse, startOfDay } from 'date-fns'
import express from 'express'
import puppeteer from 'puppeteer'
import { dateToString, formatDate, stringToDate } from '../../frontend/src/utils/date'
import { getUser, isAuthenticated } from '../middlewares/permissions'
import prisma from '../prisma'
import createCargoReport from '../services/cargo_report'

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

const defaultStyle = `
    <style type="text/css">

        .pdf .page-break {
            page-break-before: always;
        }

        .pdf h1 {
            font-size: 14pt;
            text-align: center;
        }

        .pdf .border-bottom {
            border-bottom: 1px solid black;
        }

        .pdf .border-top {
            border-top: 1px solid black;
        }

        .pdf .row {
            border-bottom: 1px solid black;
            border-top: 1px solid black;
        }

        .pdf .width-20 {
            width: 20%;
        }

        .pdf .width-25 {
            width: 25%;
        }

        .pdf .width-30 {
            width: 30%;
        }

        .pdf .width-33 {
            width: 33%;
        }

        .pdf .width-40 {
            width: 40%;
        }
        
        .pdf .width-50 {
            width: 50%;
        }

        .pdf .width-70 {
            width: 70%;
        }

        .pdf .width-100 {
            width: 100%;
        }

        .pdf .align-right {
            text-align: right;
        }

        .pdf table {
            width: 100%;
            border-collapse: collapse;
            page-break-inside: avoid;
        }

        .pdf table td, .pdf table th {
            padding-left: 4px;
            padding-right: 4px;
            padding-top: 1px;
            padding-bottom: 1px;
            vertical-align: top;
        }

        .pdf table thead {
            border-top: 1px solid black;
            border-bottom: 1px solid black;
        }

        .pdf table tbody {
            border-bottom: 1px solid black;
        }
    </style>
    `

export const ordersRoute = express.Router()

ordersRoute.get(`/api/orders`, isAuthenticated, async (req, res) => {
  console.log('getting orders')

  if (!req.user) {
    return res.status(403)
  }

  if (!req.query.startDate || !req.query.endDate) {
    return res.status(400)
  }

  const startDate = stringToDate(req.query.startDate as string)
  const endDate = stringToDate(req.query.endDate as string)
  const { tenantId } = getUser(req)

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
      deliveryDate: formatDate(o.deliveryDate),
      total: o.products.map(o => o.amount * o.price).reduce((a, b) => a + b, 0),
      customer: {
        id: o.customerId,
        chain: o.customer.chain,
        name: o.customer.name,
      },
    } as GetOrderList
  })
  res.json(mapped)
})

ordersRoute.get(`/api/orders/cargo_reports`, isAuthenticated, async (req, res) => {
  console.log('getting orders')

  if (!req.query.startDate || !req.query.endDate) {
    return res.status(400)
  }

  const { tenantId } = getUser(req)

  console.log('startDate', startOfDay(parse(req.query.startDate as string, 'yyyy-MM-dd', new Date())))

  const orders = await prisma.order.findMany({
    include: {
      customer: true,
      products: {
        include: {
          products: true,
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

  const promises = orders.map((order, index) =>
    createCargoReport(company, order, index === 0),
  )

  Promise.all(promises).then(async (htmls) => {
    const document = `
    <html>
        <head>
        <link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet">
        ${defaultStyle}
        <style type="text/css">
            .order-section {
                display: block;
            }

            .order-header {
                display: flex;
                justify-content: space-between;
            }

            .company-name {
                font-weight: bold;
                font-size: 11pt;
            }

            .signature {
                color: black;
                text-align: right;
            }

            .signature div {
                display: inline-block;
                margin-left: 30px;
            }

            .siikli-footer {
                margin-top: 17px;
                text-align: right;
                font-size: 7pt;
                color: gray;
            }

        </style>
    </head>
    <body>
        ${htmls.join('')}
        <div id="pageFooter">
            <div class="signature">
                <div>
                    _____&nbsp;&nbsp;/&nbsp;&nbsp;____&nbsp;&nbsp;/&nbsp;&nbsp;20______
                </div>
                <div>
                    ________________________________
                </div>
            </div>
            <div class="siikli-footer">
                Siikli-toiminnanohjausjärjestelmä (siikli.fi)
            </div>
        </div>
    </body>
</html>`

    try {
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
          bottom: '0mm',
          left: '5mm',
        },
        displayHeaderFooter: true,
        footerTemplate: '<div style="height: 22mm;"></div>',
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
    }
    catch (err) {
      console.error(err)
      res.sendStatus(500)
    }
  })
})

ordersRoute.get(`/api/orders/:id`, isAuthenticated, async (req, res) => {
  console.log(`getting order ${req.params.id}`)

  const orderId = req.params.id
  const { tenantId } = getUser(req)

  const result = await prisma.order.findFirstOrThrow({
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
    items: result.products.map(p => (
      {
        id: p.id,
        productId: p.productId,
        price: p.price,
        price0: p.price0,
        amount: p.amount,
        packages: p.amount / p.packageSize,
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

  const result = await prisma.order.create({
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
  })
  await prisma.orderProduct.createMany({
    data: data.items.map((r) => {
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

  try {
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
      await prisma.orderProduct.createMany({
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
        return prisma.orderProduct.update({
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
        return prisma.orderProduct.delete({
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
  }
  catch (err) {
    console.error(err)
    captureException(err)
    res.status(500).json({ message: 'Failed to save order' })
  }
})
