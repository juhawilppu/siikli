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
      border-collapse: collapse;
      margin-top: 1em;
    }
    td, th {
      border: 1px solid black;
      padding: 6px;
      text-align: left;
    }
    .no-border td, .no-border th {
      border: none;
    }
    .total {
      font-weight: bold;
    }
    .footer {
      margin-top: 2em;
      font-size: 0.9em;
    }
  </style>
</head>
<body>


  <table class="no-border">
    <tr>
      <td>${invoice.company.name}</td>
      <td>LASKU / FAKTURA</td>
      <td>Sivu 1/1</td>
    </tr>
  </table>
  <table>
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

  <table>
    <tr>
      <td style="padding: 3mm; text-align: center; line-height: 1.5; width: 50%;"><strong>Toimitusosoite (jos eri kuin laskutusosoite)</strong><br/>&ndash;</td>
      <td style="padding: 3mm; text-align: center; line-height: 1.5; width: 50%;"><strong>Toimitusaika</strong><br />&ndash;</td>
    </tr>
    <tr>
      <td style="padding: 3mm; text-align: center; line-height: 1.5; width: 50%;"><strong>Yhteyshenkilönne</strong><br />&ndash;</td>
      <td style="padding: 3mm; text-align: center; line-height: 1.5; width: 50%;"><strong>Viitteenne</strong><br />${invoice.customer.invoiceReference || '-'}</td>
    </tr>
  </table>

  <table>
    <tr>
       <td><strong>Tuotenimike</strong></td>
       <td><strong>Määrä (kg/kpl)</strong></td>
       <td><strong>Ilman ALV<br />Yht EUR</strong></td>
    </tr>
    <tr>
      <td>Perunaa, porkkanaa, sipulia, ym. - lähetteen mukaan</td>
      <td>${formatNumber(invoice.totals.totalKg)}</td>
      <td>${formatNumber(invoice.totals.totalSumWithoutTax)}</td>
    </tr>
    ${!invoice.totals.totalDiscount.isZero()
      ? `<tr>
          <td>Hyvitys (${formatNumber(invoice.customer.discount)})</td>
          <td>${formatNumber(invoice.totals.totalKg)}</td>
          <td>${formatNumber(invoice.totals.totalDiscount)}</td>
          </tr>`
      : ''}
    <tr>
    <tr>
      <td>Yhteensä (ALV 0 %)</td>
      <td></td>
      <td>${formatNumber(invoice.totals.finalSumWithoutTax)}</td>
    </tr>
    <tr>
      <td>ALV 14 %</td>
      <td></td>
      <td>${formatNumber(invoice.totals.totalTax)}</td>
    </tr>
    <tr>
      <td>Yhteensä (ALV 14 %)</td>
      <td></td>
      <td>${formatNumber(invoice.totals.finalSumWithTax)}</td>
    </tr>
</table>

<table>
  <tr>
    <td>
      <strong>Maksettavaa EUR</strong><br />
      <strong>${formatNumber(invoice.totals.finalSumWithTax)}<strong>
    </td>
  </tr>
  <tr>
    <td><strong>Viitenumero:</strong> ${invoice.customer.invoiceReference || ''}</td>
  </tr>
</table>

<table>
  <tr>
    <td>
      Saajan tilinumero
    </td>
    <td>
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
