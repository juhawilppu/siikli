import type { Order, OrderStatus } from '@prisma/client'
import type { GetOrderDto, GetOrderList, PostOrderItemRequest } from '@siikli/shared'
import { dateToIso, parseIsoDate } from '@siikli/shared'
import { endOfDay, endOfMonth, parse, startOfDay, startOfMonth } from 'date-fns'
import { Decimal } from 'decimal.js'
import puppeteer from 'puppeteer'
import prisma from '../prisma'
import { serializeNumber } from '../utils/money'
import { uploadPdfToS3 } from '../utils/upload-to-s3'
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

  async createOrder(input: { tenantId: string, customerId: string, status: OrderStatus, deliveryDate: string, hasNote: boolean, noteHeader: string | null, noteBody: string | null, items: PostOrderItemRequest[] }): Promise<Order> {
    const {
      tenantId,
      customerId,
      status,
      deliveryDate,
      hasNote,
      noteHeader,
      noteBody,
      items,
    } = input

    return await prisma.$transaction(async (tx) => {
      const orderNumberResult = await tx.order.findFirst({
        where: {
          tenantId,
        },
        orderBy: {
          orderNumber: 'desc',
        },
        select: {
          orderNumber: true,
        },
      })
      const orderNumber = orderNumberResult && orderNumberResult.orderNumber ? orderNumberResult.orderNumber + 1 : 1000

      const order = await tx.order.create({
        data: {
          customerId,
          tenantId,
          status,
          deliveryDate: parseIsoDate(deliveryDate),
          orderNumber,
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

  async updateOrder(data: { tenantId: string, userId: string, customerId: string, id: string, status: OrderStatus, deliveryDate: string, hasNote: boolean, noteHeader: string | null, noteBody: string | null, items: PostOrderItemRequest[] }): Promise<void> {
    for (const item of data.items) {
      await TenantService.verifyPackageSizeAndType(item.packageType, item.packageSize, data.tenantId)
    }
    const result = await prisma.order.update({
      data: {
        deliveryDate: parseIsoDate(data.deliveryDate),
        hasNote: data.hasNote,
        status: data.status,
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

  async getOrders(tenantId: string, startDate: Date, endDate: Date, status: OrderStatus | undefined, customerId: string | undefined): Promise<GetOrderList[]> {
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
        status,
        customerId,
      },
    })
    const mapped = result.map((o) => {
      return {
        id: o.id,
        orderNumber: o.orderNumber,
        deliveryDate: dateToIso(o.deliveryDate),
        status: o.status,
        total: o.orderRows.map(o => o.amount.mul(o.price)).reduce((a, b) => a.add(b), new Decimal(0)).toNumber(),
        customer: {
          id: o.customerId,
          name: o.customer.name,
        },
      }
    })

    return mapped satisfies GetOrderList[]
  },

  async getOrder(id: string, tenantId: string): Promise<GetOrderDto> {
    const result = await prisma.order.findFirstOrThrow({
      include: {
        customer: true,
        orderRows: true,
        invoice: true,
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
      orderNumber: result.orderNumber,
      invoiceId: result.invoice?.id ?? null,
      invoiceNumber: result.invoice?.invoiceNumber ?? null,
      status: result.status,
      deliveryDate: dateToIso(result.deliveryDate),
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

    }
  },

  async getRemainingOrders(tenantId: string): Promise<number> {
    const tenant = await prisma.tenant.findFirstOrThrow({
      where: {
        id: tenantId,
      },
    })

    // TODO: Use enum
    if (tenant.subscriptionType === 'PREMIUM') {
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

  async getWaybillHtmls(tenantId: string, startDate: string, endDate: string, customerId: string | null, preview: boolean): Promise<{ document: string, orders: Order[] }> {
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
        customerId: customerId ?? undefined,
        status: {
          in: ['WAITING_FOR_DELIVERY'],
        },
      },
    })

    if (!preview) {
      await prisma.order.updateMany({
        where: {
          id: {
            in: orders.map(o => o.id),
          },
          tenantId,
          status: 'WAITING_FOR_DELIVERY',
        },
        data: {
          status: 'DELIVERED',
        },
      })
    }

    const company = await prisma.tenant.findFirstOrThrow({
      where: {
        id: tenantId,
      },
    })

    const document = await createWaybills(company, orders)

    return { document, orders }
  },

  async getWaybillPdf(tenantId: string, startDate: string, endDate: string, customerId: string | null, preview: boolean): Promise<Uint8Array> {
    const { document, orders } = await this.getWaybillHtmls(tenantId, startDate, endDate, customerId, preview)

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
      footerTemplate: '',
      printBackground: true,
    })

    await browser.close()

    if (!preview) {
      const s3Key = `${process.env.NODE_ENV === 'production' ? 'prod' : 'dev'}/waybills/${tenantId}/${startDate}-${endDate}.pdf`
      await uploadPdfToS3({
        bucket: 'siikli-prod-files',
        key: s3Key,
        pdfBuffer,
      })

      await prisma.order.updateMany({
        where: {
          id: {
            in: orders.map(o => o.id),
          },
          tenantId,
        },
        data: {
          waybillS3Key: s3Key,
        },
      })
    }

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
