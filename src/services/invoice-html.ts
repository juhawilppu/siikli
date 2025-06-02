import type { InvoiceDto } from './invoice-service'
import { formatNumber } from '../utils/money'

export function createInvoiceHtml(invoice: InvoiceDto) {
  return `
    <html>
<!DOCTYPE html>
<html lang="fi">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: sans-serif;
      max-width: 800px;
      margin: auto;
      padding: 20px;
      color: #333;
    }
    h1 {
      text-align: center;
    }

    table {
      width: 100%;
      margin-top: 1em;
      border-collapse: collapse;
    }

    td, th {
      padding: 6px;
      text-align: left;
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


  <table>
    <tr>
      <td>${invoice.company.name}</td>
      <td>LASKU / FAKTURA</td>
      <td>Sivu 1/1</td>
    </tr>
  </table>

  <table class="borders">
    <tr>
      <td style="padding: 5mm; width: 50%;"><strong>Laskun saaja</strong><br>
        ${invoice.customer.legalName}<br>
        ${invoice.customer.businessId ? `Y-tunnus ${invoice.customer.businessId}` : ''}<br>
        ${invoice.customer.streetAddress}<br>
        ${invoice.customer.postalCode} ${invoice.customer.city}
      </td>
      <td style="padding: 5mm; width: 50%;">
        <strong style="width: 40mm; display: inline-block;">Päivämäärä:</strong> ${invoice.date}<br>
        <strong style="width: 40mm; display: inline-block;">Laskun numero:</strong> ${invoice.invoiceId}<br>
        <strong style="width: 40mm; display: inline-block;">Maksuehdot:</strong> ${invoice.paymentCondition}<br>
        <strong style="width: 40mm; display: inline-block;">Eräpäivä:</strong> ${invoice.dueDate}<br>
        <strong style="width: 40mm; display: inline-block;">Viivästyskorko:</strong> ${invoice.interestRate} %<br>
        <strong style="width: 40mm; display: inline-block;">Huomautusaika:</strong> ${invoice.notificationPeriod}
      </td>
    </tr>
  </table>

  <table class="borders">
    <tr>
      <td style="padding: 2mm; text-align: center; line-height: 1.2; width: 50%;"><strong>Toimitusosoite (jos eri kuin laskutusosoite)</strong><br/>&ndash;</td>
      <td style="padding: 2mm; text-align: center; line-height: 1.2; width: 50%;"><strong>Toimitusaika</strong><br />&ndash;</td>
    </tr>
    <tr>
      <td style="padding: 2mm; text-align: center; line-height: 1.2; width: 50%;"><strong>Yhteyshenkilönne</strong><br />&ndash;</td>
      <td style="padding: 2mm; text-align: center; line-height: 1.2; width: 50%;"><strong>Viitteenne</strong><br />${invoice.customer.invoiceReference || '&ndash;'}</td>
    </tr>
  </table>

  <table>
    <tr>
       <td class="border-left border-top-bottom"><strong>Tuotenimixe</strong></td>
       <td class="border-top-bottom" style="text-align: right;"><strong>Määrä (kg/kpl)</strong></td>
       <td class="border-right border-top-bottom" style="text-align: right;"><strong>Ilman ALV<br />Yht EUR</strong></td>
    </tr>
    <tr>
      <td class="border-left">Perunaa, porkkanaa, sipulia, ym. - lähetteen mukaan</td>
      <td style="text-align: right;">${formatNumber(invoice.totals.totalKg)}</td>
      <td class="border-right" style="text-align: right;">${formatNumber(invoice.totals.totalSumWithoutTax)}</td>
    </tr>
    ${!invoice.totals.totalDiscount.isZero()
      ? `<tr>
          <td class="border-left">Hyvitys (${formatNumber(invoice.customer.discount)})</td>
          <td style="text-align: right;">${formatNumber(invoice.totals.totalKg)}</td>
          <td class="border-right" style="text-align: right;">${formatNumber(invoice.totals.totalDiscount)}</td>
          </tr>`
      : ''}
    <tr style="height: ${14 * 8}px;">
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
      <td class="border-right border-top-bottom" style="text-align: right;">${formatNumber(invoice.totals.totalTax)}</td>
    </tr>
    <tr>
      <td class="border-left border-top-bottom"><strong>Yhteensä (ALV 14 %)</strong></td>
      <td class="border-top-bottom"></td>
      <td class="border-right border-top-bottom" style="text-align: right;">${formatNumber(invoice.totals.finalSumWithTax)}</td>
    </tr>
</table>

<table class="thick-borders">
  <tr>
    <td style="text-align: center;">
      <strong>Maksettavaa EUR</strong><br />
      <strong>${formatNumber(invoice.totals.finalSumWithTax)}<strong>
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

<table>
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

</body>
</html>

    </html>
    
  `
}
