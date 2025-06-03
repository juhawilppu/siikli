import type { GetInvoiceResponseDto } from '../../frontend/src/types/types'
import type { InvoiceDto } from '../services/invoice-service'
import { addDays } from 'date-fns'
import express from 'express'
import puppeteer from 'puppeteer'
import { dateToString } from '../../frontend/src/utils/date'
import { getUser, isAuthenticated } from '../middlewares/permissions'
import prisma from '../prisma'
import { createInvoiceHtml } from '../services/invoice-html'
import { calculateTotals } from '../services/invoice-service'
import { formatNumber } from '../utils/money'

const invoiceRoute = express.Router()

invoiceRoute.get(`/api/invoices`, isAuthenticated, async (req, res) => {
  const { tenantId } = getUser(req)
  const customerId = req.query.customerId as string
  const startDate = new Date(req.query.startDate as string)
  const endDate = new Date(req.query.endDate as string)
  const preview = req.query.preview === 'true'

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

  if (preview) {
    const invoiceSummary = {
      total: formatNumber(invoice.totals.finalSumWithTax),
    } satisfies GetInvoiceResponseDto

    return res.status(200).json(invoiceSummary)
  }
  else {
    console.log('creating pdf')
    const html = createInvoiceHtml(invoice)

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox'],
    })
    const page = await browser.newPage()
    await page.setContent(html)

    const pdfBuffer = await page.pdf({
      format: 'a4',
      margin: {
        top: '40mm',
        right: '5mm',
        bottom: '20mm',
        left: '5mm',
      },
      displayHeaderFooter: true,
      headerTemplate: `
        <table style="width: 100%; font-family: Arial, Helvetica, sans-serif; font-size: 10pt;">
          <tr>
            <td style="width: 50%; text-align: left;">${invoice.company.name}</td>
            <td style="width: 30%; text-align: center;">LASKU / FAKTURA</td>
            <td style="width: 20%; text-align: right;">Sivu <span class="pageNumber"></span>/<span class="totalPages"></span></td>
          </tr>
        </table>
      `,
      footerTemplate: '<div></div>',
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
})

export default invoiceRoute
