import { InvoiceDto } from "./invoice-service";

export function createInvoiceHtml(invoice: InvoiceDto) {
  return `
    <html>
    <table>
    <tr>
    ${invoice.company.name}
    </tr>
    <tr>
    LASKU FAKTURA
    </tr>
    <tr>Sivu 1/1</tr>
    </table>
    </html>
    
  `
}