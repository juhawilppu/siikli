import type { InvoiceDto } from './invoice-service'
import { formatDate, formatNumber, parseIsoDate } from '@siikli/shared'

export const DEFAULT_INVOICE_SUMMARY_ROW = 'Perunaa ym. - lähetteen mukaan'

// The max amount of invoice items per page in the appendix is 29
const LAST_ITEM_INDEX = 29

export function createInvoiceHtml(invoice: InvoiceDto) {
  return `
<html>
<!DOCTYPE html>
  <head>
    <meta charset="UTF-8">
    <style>
      body {
        font-family: 'Liberation Sans', sans-serif;
        font-size: 12pt;
        color: black;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        border-spacing: 0;
      }

      td, th {
        padding: 6px;
        text-align: left;
      }

      td {
        vertical-align: top;
      }

      .width-10 {
        width: 10%;
      }

      .width-20 {
        width: 20%;
      }

      .width-30 {
        width: 30%;
      }

      table.borders td, th {
        border: 1px solid black;
      }

      table.thick-borders td, th {
        border: 4px solid black;
      }

      td.border-top-bottom {
        border-top: 1px solid black;
        border-bottom: 1px solid black;
      }
      
      td.border-bottom {
        border-bottom: 1px solid black;
      }

      td.border-right {
        border-right: 1px solid black;
      }

      td.border-left {
        border-left: 1px solid black;
      }

      .footer {
        margin-top: 2em;
        font-size: 0.9em;
      }
    </style>
  </head>
  <body>

    <table class="borders">
      <tr>
        <td style="padding: 5mm; width: 50%;"><strong>Laskun saaja</strong><br>
          ${invoice.customer.legalName || invoice.customer.name}<br>
          ${invoice.customer.businessId ? `Y-tunnus ${invoice.customer.businessId}` : ''}<br>
          ${invoice.customer.streetAddress || ''}<br>
          ${invoice.customer.postalCode || ''} ${invoice.customer.city || ''}
        </td>
        <td style="padding: 5mm; width: 50%;">
          <strong style="width: 40mm; display: inline-block;">Päivämäärä:</strong> ${formatDate(parseIsoDate(invoice.date))}<br>
          <strong style="width: 40mm; display: inline-block;">Laskun numero:</strong> ${invoice.invoiceId}<br>
          <strong style="width: 40mm; display: inline-block;">Maksuehdot:</strong> ${invoice.paymentCondition}<br>
          <strong style="width: 40mm; display: inline-block;">Eräpäivä:</strong> ${formatDate(parseIsoDate(invoice.dueDate))}<br>
          <strong style="width: 40mm; display: inline-block;">Viivästyskorko:</strong> ${invoice.interestRate} %<br>
          <strong style="width: 40mm; display: inline-block;">Huomautusaika:</strong> ${invoice.notificationPeriod}
        </td>
      </tr>
    </table>

    <table class="borders" style="margin-top: 5mm;">
      <tr>
        <td style="padding: 2mm; text-align: center; line-height: 1.2; width: 50%;"><strong>Toimitusosoite (jos eri kuin laskutusosoite)</strong><br/>&ndash;</td>
        <td style="padding: 2mm; text-align: center; line-height: 1.2; width: 50%;"><strong>Toimitusaika</strong><br />&ndash;</td>
      </tr>
      <tr>
        <td style="padding: 2mm; text-align: center; line-height: 1.2; width: 50%;"><strong>Yhteyshenkilönne</strong><br />&ndash;</td>
        <td style="padding: 2mm; text-align: center; line-height: 1.2; width: 50%;"><strong>Viitteenne</strong><br />${invoice.customer.invoiceReference || '&ndash;'}</td>
      </tr>
    </table>

    <table style="margin-top: 5mm;">
      <tr>
        <td class="border-left border-top-bottom"><strong>Tuotenimike</strong></td>
        <td class="border-top-bottom" style="text-align: right;"><strong>Määrä (kg/kpl)</strong></td>
        <td class="border-right border-top-bottom" style="text-align: right;"><strong>Ilman ALV<br />Yht EUR</strong></td>
      </tr>
      <tr>
        <td class="border-left">${invoice.company.invoiceSumRow || DEFAULT_INVOICE_SUMMARY_ROW}</td>
        <td style="text-align: right;">${formatNumber(invoice.totals.totalKg)}</td>
        <td class="border-right" style="text-align: right;">${formatNumber(invoice.totals.totalSumWithoutTax)}</td>
      </tr>
      ${!invoice.totals.totalDiscountWithoutTax.isZero()
        ? `<tr>
            <td class="border-left">Hyvitys (${formatNumber(invoice.customer.discount)})</td>
            <td style="text-align: right;">${formatNumber(invoice.totals.totalKg)}</td>
            <td class="border-right" style="text-align: right;">&ndash;${formatNumber(invoice.totals.totalDiscountWithoutTax)}</td>
            </tr>`
        : ''}
      <tr style="height: ${16 * 12}px;">
        <td class="border-left"></td>
        <td></td>
        <td class="border-right"></td>
      </tr>
      <tr>
        <td class="border-left border-top-bottom"><strong>Yhteensä (ALV 0 %)</strong></td>
        <td class="border-top-bottom"></td>
        <td class="border-right border-top-bottom" style="text-align: right;">${formatNumber(invoice.totals.finalSumWithoutTax)}</td>
      </tr>
      <tr>
        <td class="border-left border-top-bottom"><strong>ALV 14 %</strong></td>
        <td class="border-top-bottom"></td>
        <td class="border-right border-top-bottom" style="text-align: right;">${formatNumber(invoice.totals.finalTax)}</td>
      </tr>
      <tr>
        <td class="border-left border-top-bottom"><strong>Yhteensä (ALV 14 %)</strong></td>
        <td class="border-top-bottom"></td>
        <td class="border-right border-top-bottom" style="text-align: right;">${formatNumber(invoice.totals.finalSumWithTax)}</td>
      </tr>
    </table>

    <table class="thick-borders" style="margin-top: 5mm;">
      <tr>
        <td style="text-align: center;">
          <strong>Maksettavaa</strong><br />
          <strong>${formatNumber(invoice.totals.finalSumWithTax)} EUR<strong>
        </td>
      </tr>
      ${invoice.customer.invoiceReference
        ? `
        <tr>
          <td style="text-align: center;"><strong>Viitenumero:</strong> ${invoice.customer.invoiceReference}</td>
        </tr>
      `
        : ''}
    </table>

    <table style="margin-top: 5mm;">
      <tr>
        <td class="border-left border-top-bottom" style="width: 50%;">
          <strong>Saajan tilinumero:</strong><br /><br />
        </td>
        <td class="border-right border-top-bottom" style="width: 50%;">
          ${invoice.company.bankNumber}<br />
          ${invoice.company.bankName}
        </td>
      </tr>
    </table>

    <table style="margin-top: 15mm; page-break-inside: avoid;">
        <tr>
          <td class="border-left border-top-bottom" style="width: 25%;"><strong>Osoite</strong><br />
          ${invoice.company.name || ''}<br />
          ${invoice.company.streetAddress || ''}<br />
          ${invoice.company.postalCode || ''} ${invoice.company.city || ''}
          </td>
          <td class="border-top-bottom" style="width: 25%;">
            <strong>Puhelin</strong><br />
            ${invoice.company.phone || ''}<br /><br /><br />
          </td>
          <td class="border-top-bottom" style="width: 25%;">
            <strong>Sähköposti / WWW</strong><br />
            ${invoice.company.email || ''}<br />
            ${invoice.company.website || ''}<br /><br />
          </td>
          <td class="border-right border-top-bottom" style="width: 25%;">
            ${invoice.company.businessId ? `<strong>Y-tunnus</strong><br />${invoice.company.businessId}` : ''}
          </td>
        </tr>
    </table>

    <table style="border-collapse: collapse;">
      <thead>
        <tr>
          <td class="border-left border-top-bottom"><strong>Toimitus&shy;päivä</strong></td>
          <td class="border-top-bottom"><strong>Tilaus&shy;numero</strong></td>
          <td class="border-top-bottom"><strong>Tuotenimike</strong></td>
          <td class="border-top-bottom" style="text-align: right;"><strong>Määrä (kg/kpl)</strong></td>
          <td class="border-top-bottom" style="text-align: right;"><strong>Yksikkö&shy;hinta (€/kg/kpl) ALV 0 %</strong></td>
          <td class="border-top-bottom" style="text-align: right;"><strong>Kokonais&shy;hinta (€) ALV 0 %</strong></td>
          <td class="border-right border-top-bottom" style="text-align: right;"><strong>Kokonais&shy;hinta (€) ALV 14 %</strong></td>
        </tr>
      </thead>
      <tbody>
        ${invoice.items.map((item, i) => `
          <tr>
            <td class="width-10 border-left ${i === LAST_ITEM_INDEX ? 'border-bottom' : ''}">${formatDate(item.deliveryDate)}</td>
            <td class="width-10 ${i === LAST_ITEM_INDEX ? 'border-bottom' : ''}">${item.orderNumber}</td>
            <td class="width-30 ${i === LAST_ITEM_INDEX ? 'border-bottom' : ''}">${item.productName}</td>
            <td class="width-20 ${i === LAST_ITEM_INDEX ? 'border-bottom' : ''}" style="text-align: right;">${formatNumber(item.quantity)}</td>
            <td class="width-10 ${i === LAST_ITEM_INDEX ? 'border-bottom' : ''}" style="text-align: right;">${formatNumber(item.priceWithoutTax)}</td>
            <td class="width-10 ${i === LAST_ITEM_INDEX ? 'border-bottom' : ''}" style="text-align: right;">${formatNumber(item.totalWithoutTax)}</td>
            <td class="width-10 border-right ${i === LAST_ITEM_INDEX ? 'border-bottom' : ''}" style="text-align: right;">${formatNumber(item.totalWithTax)}</td>
          </tr>
        `).join('')}
        ${invoice.items.length === 0
          ? `<tr><td class="border-left border-bottom border-right" colspan="6" style="text-align: center;">Ei tuotteita</td></tr>`
          : ''}
        <tr>
          <td class="border-left border-top-bottom" colspan="2"><strong>Yhteensä</strong></td>
          <td class="border-top-bottom"></td>
          <td class="border-top-bottom" style="text-align: right;">${formatNumber(invoice.totals.totalKg)}</td>
          <td class="border-top-bottom"></td>
          <td class="border-top-bottom" style="text-align: right;">${formatNumber(invoice.totals.totalSumWithoutTax)}</td>
          <td class="border-right border-top-bottom" style="text-align: right;">${formatNumber(invoice.totals.totalSumWithTax)}</td>
        </tr>
      </tbody>
    </table>
  </body>
</html>
  `
}
