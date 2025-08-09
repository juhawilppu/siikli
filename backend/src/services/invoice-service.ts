import { dateToIso } from '@siikli/shared'
import { addDays } from 'date-fns'
import Decimal from 'decimal.js'
import prisma from '../prisma'

export type InvoiceRow = {
  usePrice0: true
  deliveryDate: Date
  orderNumber: number
  productName: string
  quantity: Decimal
  priceWithTax: undefined
  priceWithoutTax: Decimal
  totalWithTax: Decimal
  totalWithoutTax: Decimal
  tax: Decimal
}
| {
  usePrice0: false
  deliveryDate: Date
  orderNumber: number
  productName: string
  quantity: Decimal
  priceWithTax: Decimal
  priceWithoutTax: undefined
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
  price0: Decimal
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
    showPriceWithoutTax: boolean
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
  }
  paymentCondition: string
  interestRate: number
  notificationPeriod: string
  items: InvoiceRow[]
  totals: {
    totalSumWithTax: Decimal
    finalSumWithTax: Decimal
    totalDiscount: Decimal
    totalSumWithoutTax: Decimal
    finalSumWithoutTax: Decimal
    totalTax: Decimal
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
          orderNumber: o.waybillNumber,
          amount: p.amount,
          deliveryDate: o.deliveryDate,
          productName: p.product.name,
          price: p.price,
          price0: p.price0,
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
        showPriceWithoutTax: customer.showPriceWithoutTax,
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
      },
      ...calculateTotals(items, customer.discount, customer.showPriceWithoutTax),
    } satisfies InvoiceDto

    await prisma.invoice.create({
      data: {
        invoiceNumber,
        customerId: customer.id,
        tenantId,
        content: JSON.stringify(invoice),
      },
    })

    return invoice
  },
}

export function calculateTotals(items: InvoiceItemDto[], discount: Decimal, usePrice0: boolean) {
  let totalSumWithoutTax = new Decimal(0)
  let totalSumWithTax = new Decimal(0)
  let totalDiscount = new Decimal(0)
  let totalTax = new Decimal(0)
  let finalSumWithoutTax = new Decimal(0)
  let finalSumWithTax = new Decimal(0)
  let totalKg = new Decimal(0)

  const invoiceRows: InvoiceRow[] = []

  for (const item of items) {
    if (usePrice0) {
      // Calculation will be based on VAT 0 % price
      const priceWithTax = undefined
      const priceWithoutTax = new Decimal(item.price0).toDecimalPlaces(2, Decimal.ROUND_HALF_UP)

      const totalWithoutTax = new Decimal(item.amount).mul(priceWithoutTax).toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
      const totalWithTax = totalWithoutTax.mul(1.14).toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
      const tax = (totalWithTax.sub(totalWithoutTax)).toDecimalPlaces(2, Decimal.ROUND_HALF_UP)

      invoiceRows.push({
        usePrice0,
        deliveryDate: item.deliveryDate,
        orderNumber: item.orderNumber,
        productName: item.productName,
        quantity: item.amount,
        priceWithTax,
        priceWithoutTax,
        totalWithTax,
        totalWithoutTax,
        tax,
      })
    }
    else {
      // Calculation will be based on VAT 14 % price
      const priceWithTax = new Decimal(item.price).toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
      const priceWithoutTax = undefined

      const totalWithTax = new Decimal(item.amount).mul(priceWithTax).toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
      const totalWithoutTax = totalWithTax.div(1.14).toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
      const tax = (totalWithTax.sub(totalWithoutTax)).toDecimalPlaces(2, Decimal.ROUND_HALF_UP)

      invoiceRows.push({
        usePrice0,
        deliveryDate: item.deliveryDate,
        orderNumber: item.orderNumber,
        productName: item.productName,
        quantity: item.amount,
        priceWithTax,
        priceWithoutTax,
        totalWithTax,
        totalWithoutTax,
        tax,
      })
    }
  }

  for (const invoiceRow of invoiceRows) {
    totalSumWithoutTax = totalSumWithoutTax.add(invoiceRow.totalWithoutTax)
    totalSumWithTax = totalSumWithTax.add(invoiceRow.totalWithTax)
    totalKg = totalKg.add(invoiceRow.quantity)
  }

  totalSumWithTax = totalSumWithTax.toDecimalPlaces(2, Decimal.ROUND_HALF_UP)

  totalSumWithoutTax = totalSumWithTax
    .div(1.14)
    .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)

  totalDiscount = totalSumWithoutTax
    .mul(new Decimal(discount).div(100))
    .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)

  finalSumWithoutTax = totalSumWithoutTax.sub(totalDiscount).toDecimalPlaces(2, Decimal.ROUND_HALF_UP)

  totalTax = finalSumWithoutTax
    .mul(0.14)
    .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)

  // TODO: Rows are calculated differently regarding tax. Tax is there subtracted from the total-total without tax.
  finalSumWithTax = finalSumWithoutTax.add(totalTax)

  return {
    items: invoiceRows,
    totals: {
      totalSumWithoutTax,
      totalSumWithTax,
      totalDiscount,
      totalTax,
      finalSumWithoutTax,
      finalSumWithTax,
      totalKg,
    },
  }
}
