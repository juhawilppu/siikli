import type { Order } from '@prisma/client'
import type { GetOrderList } from '../../frontend/src/types/types'
import { endOfDay, endOfMonth, parse, startOfDay, startOfMonth } from 'date-fns'
import { Decimal } from 'decimal.js'
import puppeteer from 'puppeteer'
import { dateToString } from '../../frontend/src/utils/date'
import prisma from '../prisma'
import { createWaybills } from './waybill'

export interface OrderRowDto {
  productId: string
  amount: Decimal
  price: Decimal
  price0: Decimal
  packageSize: number
  packageType: string
  freetext: string | null
}

export const OrderService = {

  async createOrder(input: { tenantId: string, customerId: string, deliveryDate: Date, hasNote: boolean, noteHeader: string | null, noteBody: string | null, orderRows: any[] }): Promise<Order> {
    const {
      tenantId,
      customerId,
      deliveryDate,
      hasNote,
      noteHeader,
      noteBody,
      orderRows,
    } = input

    return await prisma.$transaction(async (tx) => {
      const waybillNumber = await tx.order.count({
        where: {
          tenantId,
        },
      }) + 1

      const order = await tx.order.create({
        data: {
          customerId,
          tenantId,
          deliveryDate,
          waybillNumber,
          hasNote,
          noteHeader,
          noteBody,
        },
      })

      for (const orderRow of orderRows) {
        if (orderRow.price.div(1.14).toDecimalPlaces(2).cmp(orderRow.price0) !== 0) {
          throw new Error('Price and price0 do not match')
        }

        await tx.orderRow.create({
          data: {
            orderId: order.id,
            productId: orderRow.productId,
            amount: orderRow.amount,
            price: orderRow.price,
            price0: orderRow.price0,
            packageSize: orderRow.packageSize,
            packageType: orderRow.packageType,
            tenantId,
            freetext: orderRow.freetext,
          },
        })
      }

      return order
    })
  },

  async getOrders(tenantId: string, startDate: Date, endDate: Date): Promise<GetOrderList[]> {
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
        deliveryDate: dateToString(o.deliveryDate),
        total: o.orderRows.map(o => o.amount.mul(o.price)).reduce((a, b) => a.add(b), new Decimal(0)).toNumber(),
        customer: {
          id: o.customerId,
          name: o.customer.name,
        },
      }
    })

    return mapped satisfies GetOrderList[]
  },

  async getOrder(id: string, tenantId: string): Promise<any> {
    return await prisma.order.findUnique({
      where: {
        id,
        tenantId,
      },
      include: {
        orderRows: true,
      },
    })
  },

  async getRemainingOrders(tenantId: string): Promise<number> {
    const tenant = await prisma.tenant.findFirstOrThrow({
      where: {
        id: tenantId,
      },
    })
    if (tenant.subscriptionType === 'premium') {
      return 10000
    }

    const orders = await prisma.order.count({
      where: {
        tenantId,
        createdAt: {
          gte: startOfMonth(new Date()),
          lte: endOfMonth(new Date()),
        },
      },
    })

    return Math.max(0, 20 - orders)
  },

  async getWaybillHtmls(tenantId: string, startDate: string, endDate: string): Promise<string> {
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
          gte: startOfDay(parse(startDate as string, 'yyyy-MM-dd', new Date())),
          lte: endOfDay(parse(endDate as string, 'yyyy-MM-dd', new Date())),
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

    return document
  },

  async getWaybillPdf(tenantId: string, startDate: string, endDate: string): Promise<Uint8Array> {
    const document = await this.getWaybillHtmls(tenantId, startDate, endDate)

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

    return pdfBuffer
  },
}
