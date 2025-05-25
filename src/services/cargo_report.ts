import type { Customer, Order, OrderProduct, Product, Tenant } from '@prisma/client'
import { formatDate } from '../../frontend/src/utils/date'

export default async function createCargoReport(
  company: Tenant,
  order: Order & {
    products: (OrderProduct & {
      products: Product
    })[]
    customer: Customer
  },
  first: boolean,
) {
  const itemsTable = order.products.map((item) => {
    return `
            <tr>
                <td class="align-left width-40">${item.products.name} ${item.price < 0 ? '(Hyvitys)' : ''
                }</td>
                <td class="align-right width-20">${item.amount}</td>
                <td class="align-right width-20">${item.price
                  .toFixed(2)
                  .replace('.', ',')}</td>
                <td class="align-right width-20">${(item.amount * item.price)
                  .toFixed(2)
                  .replace('.', ',')}</td>
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
            </div>
            <table>
                <thead>
                    <tr>
                        <td class="align-left width-40">Tuote</td>
                        <td class="align-right width-20">Kappalemäärä (kg)</td>
                        <td class="align-right width-20">Kilohinta (€/kg/kpl)<br>sis. ALV 14 %</td>
                        <td class="align-right width-20">Kokonaishinta (€)<br>sis. ALV 14 %</td>
                    </tr>
                </thead>
                <tbody>
                    ${itemsTable.join('')}
                </tbody>
            </table>
            ${note}
        <div>
    `

  console.log(html)

  return html
}
