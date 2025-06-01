import { addDays } from 'date-fns'
import express from 'express'
import { dateToString } from '../../frontend/src/utils/date'
import { calculateTotals } from '../services/invoice-service'
import { getUser, isAuthenticated } from '../middlewares/permissions'
import prisma from '../prisma'
import { GetInvoiceResponseDto } from '../../frontend/src/types/types'
import { formatNumber } from '../utils/money'

const invoiceRoute = express.Router()

invoiceRoute.get(`/api/invoices`, isAuthenticated, async (req, res) => {
  const { tenantId } = getUser(req)
  const customerId = req.query.customerId as string
  const startDate = new Date(req.query.startDate as string)
  const endDate = new Date(req.query.endDate as string)

  const customer = await prisma.customer.findUnique({
    where: {
      id: customerId,
      tenantId,
    },
  })

  if (!customer)
    throw new Error('Customer not found')

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

  if (orders.length === 0 || items.length === 0) {
    return res.status(400).json({ error: 'No items found' })
  }
  
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
    date: dateToString(today),
    dueDate: dateToString(addDays(today, notificationPeriod)),
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
    },
    company: {
      name: company.name,
    },
    ...calculateTotals(items, customer.discount, customer.showPriceWithoutTax),
  }
  
  await prisma.invoice.create({
    data: {
      invoiceNumber,
      customerId: customer.id,
      tenantId,
      content: JSON.stringify(invoice),
    },
  })

  const invoiceSummary = {
    total: formatNumber(invoice.totals.finalSumWithTax),
  } satisfies GetInvoiceResponseDto

  return res.status(200).json(invoiceSummary)
  },
)

export default invoiceRoute
