import type { InvoiceDto } from '../../frontend/src/types/types'
import { addDays } from 'date-fns'
import express from 'express'
import { dateToString } from '../../frontend/src/utils/date'
import { calculateTotals, serializeInvoice } from '../invoice-service'
import { getUser, isAuthenticated } from '../middlewares/permissions'
import prisma from '../prisma'

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
        products: {
          include: {
            products: true,
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
      return o.products.map((p) => {
        return {
          orderId: o.id,
          orderNumber: 1,
          amount: p.amount,
          deliveryDate: o.deliveryDate,
          productName: p.products.name,
          price: p.price,
          price0: p.price0,
        }
      })
    },
    ).flat()

    const notificationPeriod = 14

    const invoice = {
      invoiceId: 1001,
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
      ...serializeInvoice(calculateTotals(items, customer.discount, customer.showPriceWithoutTax)),
    }

    return res.status(200).json(invoice as InvoiceDto)
  },
)

export default invoiceRoute
