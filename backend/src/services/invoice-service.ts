import { dateToIso } from '@siikli/shared'
import { addDays } from 'date-fns'
import Decimal from 'decimal.js'
import prisma from '../prisma'
import { uploadPdfToS3 } from '../utils/upload-to-s3'
import { DEFAULT_INVOICE_SUMMARY_ROW } from './invoice-html'

export interface InvoiceRow {
  deliveryDate: Date
  orderNumber: number
  productName: string
  quantity: Decimal
  priceWithoutTax: Decimal
  totalWithTax: Decimal
  totalWithoutTax: Decimal
  tax: Decimal
}

export interface InvoiceItemDto {
  id: string
  orderId: string
  orderNumber: number
  deliveryDate: Date
  productName: string
  amount: Decimal
  price: Decimal
}

export interface InvoiceDto {
  invoiceId: number
  date: string
  dueDate: string
  customer: {
    streetAddress: string | null
    postalCode: string | null
    city: string | null
    name: string
    legalName: string | null
    businessId: string | null
    invoiceReference?: string
    discount: Decimal
  }
  company: {
    name: string
    bankNumber: string
    bankName: string
    streetAddress: string | null
    postalCode: string | null
    city: string | null
    phone: string | null
    email: string | null
    website: string | null
    businessId: string | null
    invoiceSumRow: string
  }
  paymentCondition: string
  interestRate: number
  notificationPeriod: string
  items: InvoiceRow[]
  totals: {
    totalSumWithTax: Decimal
    finalSumWithTax: Decimal
    totalDiscountWithoutTax: Decimal
    totalDiscountWithTax: Decimal
    totalSumWithoutTax: Decimal
    finalSumWithoutTax: Decimal
    finalTax: Decimal
    totalKg: Decimal
  }
}

export const InvoiceService = {
  async getInvoice(customerId: string, tenantId: string, startDate: Date, endDate: Date) {
    const customer = await prisma.customer.findUnique({
      where: {
        id: customerId,
        tenantId,
      },
    })
    if (!customer) {
      throw new Error('Customer not found')
    }

    const orders = await prisma.order.findMany({
      where: {
        customerId: customer.id,
        status: 'DELIVERED',
        tenantId,
        deliveryDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        deliveryDate: 'asc',
      },
      include: {
        orderRows: {
          include: {
            product: true,
          },
        },
      },
    })

    const company = await prisma.tenant.findFirstOrThrow({
      where: {
        id: tenantId,
      },
    })

    const today = new Date()

    const items = orders.map((o) => {
      return o.orderRows.map((p) => {
        return {
          id: p.id,
          orderId: o.id,
          orderNumber: o.orderNumber,
          amount: p.amount,
          deliveryDate: o.deliveryDate,
          productName: p.product.name,
          price: p.price,
        }
      })
    },
    ).flat()

    const notificationPeriod = 14

    const lastInvoice = await prisma.invoice.findFirst({
      where: {
        tenantId,
      },
      orderBy: {
        invoiceNumber: 'desc',
      },
    })

    const invoiceNumber = lastInvoice ? lastInvoice.invoiceNumber + 1 : 1000

    const invoice = {
      invoiceId: invoiceNumber,
      date: dateToIso(today),
      dueDate: dateToIso(addDays(today, notificationPeriod)),
      paymentCondition: `${notificationPeriod} päivää`,
      notificationPeriod: `${notificationPeriod} päivää`,
      interestRate: 7,
      customer: {
        name: customer.name,
        legalName: customer.companyLegalName,
        streetAddress: customer.streetAddress,
        postalCode: customer.postalCode,
        city: customer.city,
        businessId: customer.businessId,
        discount: customer.discount,
      },
      company: {
        name: company.name,
        bankNumber: company.invoiceBankAccount ?? '',
        bankName: company.invoiceBankName ?? '',
        streetAddress: company.streetAddress,
        postalCode: company.postalCode,
        city: company.city,
        phone: company.phone,
        email: company.email,
        website: company.website,
        businessId: company.businessId,
        invoiceSumRow: company.invoiceSumRow || DEFAULT_INVOICE_SUMMARY_ROW,
      },
      ...calculateTotals(items, customer.discount),
    } satisfies InvoiceDto

    return { invoice, orders }
  },
  async storeInvoice(invoiceId: number, tenantId: string, customerId: string, ordersIds: string[], total: Decimal, pdfBuffer: Uint8Array) {
    const filename = `${invoiceId}-${customerId}-${dateToIso(new Date())}.pdf`
    const { key } = await uploadPdfToS3({
      bucket: 'siikli-prod-files',
      key: `${process.env.NODE_ENV === 'production' ? 'prod' : 'dev'}/tenant/${tenantId}/invoices/${filename}`,
      pdfBuffer, // Uint8Array
      metadata: { tenantId, invoiceId: invoiceId.toString(), issuedAt: new Date().toISOString() },
    })
    await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber: invoiceId,
          status: 'PENDING',
          customerId,
          tenantId,
          filename: key,
          total,
        },
      })
      await tx.order.updateMany({
        where: {
          id: { in: ordersIds },
          tenantId,
          status: 'DELIVERED',
        },
        data: { invoiceId: invoice.id, status: 'INVOICED' },
      })
    })
  },
  async getInvoices(customerId: string, tenantId: string, startDate: Date, endDate: Date) {
    const invoices = await prisma.invoice.findMany({
      where: {
        customerId,
        tenantId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        customer: true,
      },
    })
    return invoices
  },
}

export function calculateTotals(items: InvoiceItemDto[], discountPercent: Decimal) {
  let totalNet = new Decimal(0)
  let totalGross = new Decimal(0)
  let totalKg = new Decimal(0)

  const rows: InvoiceRow[] = []

  for (const item of items) {
    const unitNet = new Decimal(item.price).toDecimalPlaces(2, Decimal.ROUND_HALF_UP)

    const rowNet = unitNet.mul(item.amount).toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
    const rowVat = rowNet.mul(0.14).toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
    const rowGross = rowNet.add(rowVat)

    rows.push({
      deliveryDate: item.deliveryDate,
      orderNumber: item.orderNumber,
      productName: item.productName,
      quantity: item.amount,
      priceWithoutTax: unitNet,
      totalWithoutTax: rowNet,
      tax: rowVat,
      totalWithTax: rowGross,
    })

    totalNet = totalNet.add(rowNet)
    totalGross = totalGross.add(rowGross)
    totalKg = totalKg.add(item.amount)
  }

  // Discount
  const discountNet = totalNet
    .mul(discountPercent.div(100))
    .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)

  const discountVat = discountNet
    .mul(0.14)
    .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)

  const discountGross = discountNet.add(discountVat)

  // Final totals
  const finalNet = totalNet.sub(discountNet).toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
  const finalGross = totalGross.sub(discountGross).toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
  const finalVat = finalGross.sub(finalNet).toDecimalPlaces(2, Decimal.ROUND_HALF_UP)

  return {
    items: rows,
    totals: {
      totalSumWithoutTax: totalNet,
      totalSumWithTax: totalGross,
      totalDiscountWithoutTax: discountNet,
      totalDiscountWithTax: discountGross,
      finalSumWithoutTax: finalNet,
      finalSumWithTax: finalGross,
      finalTax: finalVat,
      totalKg,
    },
  }
}
