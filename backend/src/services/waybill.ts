import type { Customer, Order, OrderRow, Product, Tenant } from '@prisma/client'
import { formatDate, formatNumber } from '@siikli/shared'

const defaultStyle = `
    <style type="text/css">
        body {
          font-family: 'Roboto', sans-serif;
          font-size: 9pt;
        }

        .pdf {
          font-family: 'Roboto', sans-serif;
          font-size: 9pt;
        }

        
        .pdf .page-break {
            page-break-before: always;
        }

        .pdf h1 {
            font-size: 14pt;
            text-align: center;
        }

        .pdf .border-bottom {
            border-bottom: 1px solid black;
        }

        .pdf .border-top {
            border-top: 1px solid black;
        }

        .pdf .row {
            border-bottom: 1px solid black;
            border-top: 1px solid black;
        }

        .pdf .width-20 {
            width: 20%;
        }

        .pdf .width-25 {
            width: 25%;
        }

        .pdf .width-30 {
            width: 30%;
        }

        .pdf .width-33 {
            width: 33%;
        }

        .pdf .width-40 {
            width: 40%;
        }
        
        .pdf .width-50 {
            width: 50%;
        }

        .pdf .width-70 {
            width: 70%;
        }

        .pdf .width-100 {
            width: 100%;
        }

        .pdf .align-right {
            text-align: right;
        }

        .pdf table {
            width: 100%;
            border-collapse: collapse;
            page-break-inside: avoid;
            font-size: 10pt;
        }

        .pdf table td, .pdf table th {
            padding-left: 4px;
            padding-right: 4px;
            padding-top: 1px;
            padding-bottom: 1px;
            vertical-align: top;
        }

        .pdf table thead {
            border-top: 1px solid black;
            border-bottom: 1px solid black;
            font-weight: bold;
        }

        .pdf table tbody {
            border-bottom: 1px solid black;
        }
        
        .order-section {
          display: block;
          position: relative;
          height: calc(210mm - 12mm);
        }

        .company-name {
            font-weight: bold;
            font-size: 11pt;
        }

        .signature {
            color: black;
            text-align: right;
        }

        .signature div {
            display: inline-block;
            margin-left: 30px;
        }
    </style>
    `

export async function createWaybills(tenant: Tenant, orders: (Order & {
  orderRows: (OrderRow & {
    product: Product
  })[]
  customer: Customer
})[]) {
  const promises = orders.map((order, index) =>
    createWaybill(tenant, order, index === 0),
  )

  const htmls = await Promise.all(promises)
  const document = `
    <html>
        <head>
        <link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet">
        ${defaultStyle}
    </head>
    <body class="pdf">
        ${htmls.join('')}
    </body>
</html>`

  return document
}

export default async function createWaybill(
  company: Tenant,
  order: Order & {
    orderRows: (OrderRow & {
      product: Product
    })[]
    customer: Customer
  },
  first: boolean,
) {
  const itemsTable = order.orderRows.map((item) => {
    return `
            <tr>
                <td class="align-left width-25">${item.product.name} ${item.price.lessThan(0) ? '(Hyvitys)' : ''
                }</td>
                <td class="align-right width-25">${formatNumber(item.amount)}</td>
                <td class="align-right width-25">${formatNumber(item.price)} €</td>
                <td class="align-right width-25">${formatNumber(item.amount.mul(item.price))} €</td>
            </tr>`
  })
  const note = order.noteBody
    ? `
        <div style="margin-top: 10pt;">
            ${order.noteHeader ? `<h3>${order.noteHeader}</h3>` : ``}
            <div>${order.noteBody}</div>
        </div>
    `
    : ''

  const html = `
        <div class="order-section ${first ? '' : 'page-break'}">
            <div style="height: 3em;">
                <div style="float: left;">
                    <div class="company-name">${company.name}</div>
                    <div>${company.streetAddress}</div>
                    <div>${company.postalCode} ${company.city}</div>
                </div>
                <div style="float: right;">
                    Y-tunnus: ${company.businessId}
                </div>
            </div>
            <h1>Kuormakirja</h1>
            <div style="margin-bottom: 10pt;">
                <div><b>Asiakas:</b> <span>${order.customer.name}</span></div>
                <div><b>Toimituspäivä:</b> <span>${formatDate(order.deliveryDate)}</span></div>
                <div><b>Tilausnumero:</b> <span>${order.waybillNumber}</span></div>
            </div>
            <table>
                <thead>
                    <tr>
                        <td class="align-left width-25">Tuote</td>
                        <td class="align-right width-25">Kappalemäärä (kg)</td>
                        <td class="align-right width-25">Kilohinta (€/kg/kpl)<br>sis. ALV 14 %</td>
                        <td class="align-right width-25">Kokonaishinta (€)<br>sis. ALV 14 %</td>
                    </tr>
                </thead>
                <tbody>
                    ${itemsTable.join('')}
                </tbody>
            </table>
            ${note}
            <div class="signature" style="position: absolute; bottom: 20px; width: 100%;">
                <div>
                    ____&nbsp;&nbsp;/&nbsp;&nbsp;____&nbsp;&nbsp;/&nbsp;&nbsp;20______
                </div>
                <div>
                    ________________________________
                </div>
            </div>
        </div>
    `

  console.log(html)

  return html
}
