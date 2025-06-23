import type { Order } from '@prisma/client'
import type { GetOrderDto, GetOrderList, PostOrderItemRequest, PostOrderItemRequestDto } from '../../frontend/src/types/types'
import { endOfDay, endOfMonth, parse, startOfDay, startOfMonth } from 'date-fns'
import { Decimal } from 'decimal.js'
import puppeteer from 'puppeteer'
import { dateToString, stringToDate } from '../../frontend/src/utils/date'
import prisma from '../prisma'
import { serializeNumber } from '../utils/money'
import { TenantService } from './tenant-service'
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

  async createOrder(input: { tenantId: string, customerId: string, deliveryDate: Date, hasNote: boolean, noteHeader: string | null, noteBody: string | null, items: PostOrderItemRequest[] }): Promise<Order> {
    const {
      tenantId,
      customerId,
      deliveryDate,
      hasNote,
      noteHeader,
      noteBody,
      items,
    } = input

    return await prisma.$transaction(async (tx) => {
      const waybillNumberResult = await tx.order.findFirst({
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

      for (const orderRow of items) {
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

  async updateOrder(data: { tenantId: string, userId: string, customerId: string, id: string, deliveryDate: string, hasNote: boolean, noteHeader: string | null, noteBody: string | null, items: PostOrderItemRequest[] }): Promise<void> {
    for (const item of data.items) {
      await TenantService.verifyPackageSizeAndType(item.packageType, item.packageSize, data.tenantId)
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
            id: data.tenantId,
          },
        },
      },
      where: {
        id: data.id,
        tenantId: data.tenantId,
      },
    })
    console.log(data.items)
    const toCreate = data.items.filter(r => !r.id)
    if (toCreate.length > 0) {
      await prisma.orderRow.createMany({
        data: toCreate.map((r) => {
          return {
            orderId: result.id,
            tenantId: data.tenantId,
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
        userId: data.userId,
        tenantId: data.tenantId,
        event: 'update_order',
        data: {
          order: result.id,
          customer: result.customerId,
        },
      },
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
        id,
        tenantId,
      },
    })

    return {
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
          price: serializeNumber(p.price || 0),
          price0: serializeNumber(p.price0 || 0),
          amount: serializeNumber(p.amount),
          packages: p.amount.div(p.packageSize).toNumber(),
          packageSize: p.packageSize,
          packageType: p.packageType || '',
          freetext: p.freetext || '',
          createdAt: p.createdAt,
        }
      )),

    } satisfies GetOrderDto
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

  async deleteOrder(id: string, tenantId: string): Promise<void> {
    await prisma.order.delete({
      where: {
        id,
        tenantId,
      },
    })
  },
}
