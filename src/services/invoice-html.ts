import { InvoiceDto } from "./invoice-service";

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
      border: 1px solid #ccc;
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
      <td style="padding: 5mm;"><strong>Laskun saaja</strong><br>
        ${invoice.customer.legalName}<br>
        ${invoice.customer.businessId ? 'Y-tunnus ' + invoice.customer.businessId : ''}<br>
        ${invoice.customer.streetAddress}<br>
        ${invoice.customer.postalCode} ${invoice.customer.city}
      </td>
      <td style="padding: 5mm;">
        <strong style="width: 40mm; display: inline-block;">Päivämäärä:</strong> ${invoice.date}<br>
        <strong style="width: 40mm; display: inline-block;">Laskun numero:</strong> ${invoice.invoiceId}<br>
        <strong style="width: 40mm; display: inline-block;">Maksuehdot:</strong> ${invoice.paymentCondition}<br>
        <strong style="width: 40mm; display: inline-block;">Eräpäivä:</strong> ${invoice.dueDate}<br>
        <strong style="width: 40mm; display: inline-block;">Viivästyskorko:</strong> ${invoice.interestRate}%<br>
        <strong style="width: 40mm; display: inline-block;">Huomautusaika:</strong> ${invoice.notificationPeriod}
      </td>
    </tr>
  </table>

  <table>
    <tr>
      <td style="padding: 3mm; text-align: center; line-height: 1.5;"><strong>Toimitusosoite (jos eri kuin laskutusosoite)</strong><br/>&ndash;</td>
      <td style="padding: 3mm; text-align: center; line-height: 1.5;"><strong>Toimitusaika</strong><br />&ndash;</td>
    </tr>
    <tr>
      <td style="padding: 3mm; text-align: center; line-height: 1.5;"><strong>Yhteyshenkilönne</strong><br />&ndash;</td>
      <td style="padding: 3mm; text-align: center; line-height: 1.5;"><strong>Viesti</strong><br />SIIKLI-OHJELMISTON YLLÄPITO 2024</td>
    </tr>
  </table>

</body>
</html>

    </html>
    
  `
}