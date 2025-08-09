import type { GetInvoiceResponseDto } from '@siikli/shared'
import { parseIsoDate } from '@siikli/shared'
import express from 'express'
import puppeteer from 'puppeteer'
import { getUser, isAuthenticated } from '../middlewares/permissions'
import { createInvoiceHtml } from '../services/invoice-html'
import { InvoiceService } from '../services/invoice-service'
import { formatNumber } from '../utils/money'

const invoiceRoute = express.Router()

invoiceRoute.get(`/api/invoices`, isAuthenticated, async (req, res) => {
  const { tenantId } = getUser(req)
  const customerId = req.query.customerId as string
  const startDate = parseIsoDate(req.query.startDate as string)
  const endDate = parseIsoDate(req.query.endDate as string)
  const preview = req.query.preview === 'true'

  try {
    const invoice = await InvoiceService.getInvoice(customerId, tenantId, startDate, endDate)

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

      // Set headers for proper PDF display
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Length', pdfBuffer.length)
      res.setHeader('Content-Disposition', 'inline')
      res.setHeader('Cache-Control', 'no-cache')
      res.status(200)
      res.end(pdfBuffer, 'binary')
    }
  }
  catch (e) {
    if (e instanceof Error && e.message === 'Customer not found') {
      res.status(404).json({ message: 'Customer not found' })
    }
    else if (e instanceof Error) {
      console.error(e)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
})

export default invoiceRoute
