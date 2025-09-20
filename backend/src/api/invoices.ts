import type { GetInvoicesResponse } from '@siikli/shared'
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { dateToIso, GetInvoicesQuery, IdParams, parseIsoDate, PostCreateInvoiceRequest } from '@siikli/shared'
import express from 'express'
import puppeteer from 'puppeteer'
import { BadRequestError, NotFoundError } from '../middlewares/error-handler'
import { getSessionOrThrow } from '../middlewares/permissions'
import { rateLimitByUserAccount } from '../middlewares/rate-limit'
import prisma from '../prisma'
import { createInvoiceHtml } from '../services/invoice-html'
import { InvoiceService } from '../services/invoice-service'
import { TenantService } from '../services/tenant-service'
import { serializeNumber } from '../utils/serialization'

export const invoiceRoute = express.Router()

const s3 = new S3Client({ region: process.env.AWS_REGION })

invoiceRoute.get(`/api/invoices/list`, rateLimitByUserAccount(20, 1), async (req, res) => {
  const { tenantId } = getSessionOrThrow(req)
  const { customerId, startDate, endDate } = GetInvoicesQuery.parse(req.query)

  const invoices = await InvoiceService.getInvoices(customerId ?? null, tenantId, parseIsoDate(startDate), parseIsoDate(endDate))
  res.json(invoices.map(i => ({
    id: i.id,
    invoiceId: i.invoiceNumber,
    customerId: i.customerId,
    customerName: i.customer.name,
    createdAt: dateToIso(i.createdAt),
    total: serializeNumber(i.total),
    status: i.status,
  })) satisfies GetInvoicesResponse[])
})

invoiceRoute.get(`/api/invoices/:id/url`, rateLimitByUserAccount(20, 1), async (req, res) => {
  const { tenantId } = getSessionOrThrow(req)
  const { id } = IdParams.parse(req.params)

  // Look up invoice metadata in DB
  const invoice = await prisma.invoice.findUnique({ where: { id, tenantId } })
  if (!invoice?.filename) {
    throw new NotFoundError('Invoice not found')
  }

  const cmd = new GetObjectCommand({
    Bucket: 'siikli-prod-files',
    Key: invoice.filename,
  })

  const url = await getSignedUrl(s3, cmd, { expiresIn: 5 * 60 }) // 5 minutes
  res.json({ url })
})

invoiceRoute.post(`/api/invoices/:id/mark-paid`, rateLimitByUserAccount(10, 1), async (req, res) => {
  const { tenantId } = getSessionOrThrow(req)
  const { id } = IdParams.parse(req.params)

  await prisma.invoice.update({ where: { id, tenantId }, data: { status: 'PAID' } })
  res.status(204).end()
})

invoiceRoute.post(`/api/invoices`, rateLimitByUserAccount(10, 1), async (req, res) => {
  const { tenantId } = getSessionOrThrow(req)
  const { customerId, startDate, endDate, preview } = PostCreateInvoiceRequest.parse(req.body)

  const tenant = await TenantService.getTenant(tenantId)

  // For a finalized invoice, we need to have the bank account and name set
  if (!preview && (!tenant.invoiceBankAccount?.trim() || !tenant.invoiceBankName?.trim())) {
    throw new BadRequestError('required_settings_missing')
  }

  const { invoice, orders } = await InvoiceService.getInvoice(customerId, tenantId, parseIsoDate(startDate), parseIsoDate(endDate))

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

  if (!preview) {
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
