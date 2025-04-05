import { PrismaClient } from '@prisma/client'
import express from 'express'
import pdf from 'html-pdf'
import moment from 'moment'
import {
  GetOrderList,
  PostOrderDto,
  PostOrderIdDto,
} from '../../frontend/src/types/types'

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

ordersRoute.get(`/api/orders/cargo_reports`, async (req, res) => {
  console.log('getting orders')

  if (!req.user) {
    return res.status(403)
  }

  if (!req.query.startDate || !req.query.endDate) {
    return res.status(400)
  }

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

  const company = {
    name: 'MTY Männistö',
    address: 'Tevännön pikatie 191',
    postalCode: '12750',
    city: 'PILPALA',
    businessId: '2535794-6',
  }

  const promises = orders.map((order, index) =>
    require('./cargo_report')(company, order, index === 0)
  )

  Promise.all(promises).then((htmls) => {
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
                Siikli-toiminnanohjausjärjestelmä (www.siikli.fi)
            </div>
        </div>
    </body>
</html>`

    pdf
      .create(document, {
        format: 'A5',
        border: {
          top: '5mm',
          right: '5mm',
          bottom: '0mm',
          left: '5mm',
        },
        footer: {
          height: '22mm',
        },
      })
      .toStream((err, pdfStream) => {
        if (err) {
          // handle error and return a error response code
          console.log(err)
          return res.sendStatus(500)
        } else {
          // send a status code of 200 OK
          res.statusCode = 200

          // once we are done reading end the response
          pdfStream.on('end', () => {
            // done reading
            return res.end()
          })

          // pipe the contents of the PDF directly to the response
          pdfStream.pipe(res)
        }
      })
  })
})

const getOrder = async (id: string, tenantId: string) => {
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
    await getOrder(req.params.id, parseTenantId(req))
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
      id: req.params.id as string,
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
          id: r.id as string,
        },
      })
    })
    await Promise.all(promises)
  }

  res.json(
    await getOrder(req.params.id as string, parseTenantId(req))
  )
})
