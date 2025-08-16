import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { dateToIso, formatNumber, parseIsoDate } from '@siikli/shared'
import express from 'express'
import puppeteer from 'puppeteer'
import { getUser, isAuthenticated } from '../middlewares/permissions'
import prisma from '../prisma'
import { createInvoiceHtml } from '../services/invoice-html'
import { InvoiceService } from '../services/invoice-service'

const invoiceRoute = express.Router()

const s3 = new S3Client({ region: process.env.AWS_REGION })

export interface GetInvoiceListResponseDto {
  invoiceId: number
  customerId: string
  createdAt: string
  total: number
}

invoiceRoute.get(`/api/invoices/list`, isAuthenticated, async (req, res) => {
  const { tenantId } = getUser(req)
  const customerId = req.query.customerId as string
  const startDate = parseIsoDate(req.query.startDate as string)
  const endDate = parseIsoDate(req.query.endDate as string)

  const invoices = await InvoiceService.getInvoices(customerId, tenantId, startDate, endDate)
  res.json(invoices.map(i => ({
    id: i.id,
    invoiceId: i.invoiceNumber,
    customerId: i.customerId,
    customerName: i.customer.name,
    createdAt: dateToIso(i.createdAt),
    total: formatNumber(i.total),
    status: i.status,
  })))
})

invoiceRoute.get(`/api/invoices/:invoiceId/url`, isAuthenticated, async (req, res) => {
  const { tenantId } = getUser(req)
  const invoiceId = req.params.invoiceId
  // Look up invoice metadata in DB
  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId, tenantId } })
  if (!invoice?.filename)
    return res.status(404).send('Not found')

  const cmd = new GetObjectCommand({
    Bucket: 'siikli-prod-files',
    Key: invoice.filename,
  })

  const url = await getSignedUrl(s3, cmd, { expiresIn: 5 * 60 }) // 5 minutes
  res.json({ url })
})

invoiceRoute.post(`/api/invoices/:invoiceId/mark-paid`, isAuthenticated, async (req, res) => {
  const { tenantId } = getUser(req)
  const invoiceId = req.params.invoiceId
  await prisma.invoice.update({ where: { id: invoiceId, tenantId }, data: { status: 'PAID' } })
  res.json({ message: 'Invoice marked as paid' })
})

invoiceRoute.get(`/api/invoices`, isAuthenticated, async (req, res) => {
  const { tenantId } = getUser(req)
  const customerId = req.query.customerId as string
  const startDate = parseIsoDate(req.query.startDate as string)
  const endDate = parseIsoDate(req.query.endDate as string)
  const changeStatus = req.query.changeStatus === 'true'

  const { invoice, orders } = await InvoiceService.getInvoice(customerId, tenantId, startDate, endDate)

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
      top: '15mm',
      right: '5mm',
      bottom: '20mm',
      left: '5mm',
    },
    displayHeaderFooter: true,
    headerTemplate: `
        <table style="width: 100%; margin-left: 5mm; margin-right: 5mm; font-family: Arial, Helvetica, sans-serif; font-size: 12pt;">
          <tr>
            <td style="width: 50%; text-align: left; font-weight: bold;">${invoice.company.name}</td>
            <td style="width: 30%; text-align: center; font-weight: bold;">LASKU / FAKTURA</td>
            <td style="width: 20%; text-align: right;">Sivu <span class="pageNumber"></span>/<span class="totalPages"></span></td>
          </tr>
        </table>
      `,
    footerTemplate: '<div></div>',
  })

  await browser.close()

  if (changeStatus) {
    await InvoiceService.storeInvoice(invoice.invoiceId, tenantId, customerId, orders.map(o => o.id), invoice.totals.finalSumWithTax, pdfBuffer)
  }

  // Set headers for proper PDF display
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Length', pdfBuffer.length)
  res.setHeader('Content-Disposition', 'inline')
  res.setHeader('Cache-Control', 'no-cache')
  res.status(200)
  res.end(pdfBuffer, 'binary')
})

export default invoiceRoute
