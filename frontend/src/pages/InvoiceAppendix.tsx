import type { InvoiceDto } from '@/types/types'
import { formatMoneyFi } from '@/utils/money'

export function InvoiceAppendix({
  invoice,
  showTotal,
  totalPages,
}: {
  invoice: InvoiceDto
  showTotal: boolean
  totalPages: number
}) {
  const formatDate = (dateStr: Date) => new Date(dateStr).toLocaleDateString('fi-FI')

  return (
    <div className="invoice-appendix show-on-print" style={{ pageBreakBefore: 'always', position: 'relative' }}>
      <table>
        <tbody>
          <tr>
            <td className="width-50 strong">{invoice.company.name}</td>
            <td className="width-30 strong">LASKU FAKTURA</td>
            <td className="width-20 align-right">
              Sivu
              {' '}
              <span className="page-number" />
              /
              {totalPages}
            </td>
          </tr>
        </tbody>
      </table>

      <br />

      <table className="border-all">
        <thead>
          <tr className="md-title border-top border-bottom">
            <th className="align-left width-20">Toimitus&shy;päivä</th>
            <th className="align-left width-20">Tilaus&shy;numero</th>
            <th className="align-left width-20">Tuote&shy;nimike</th>
            <th className="align-right width-20">Määrä (kg/kpl)</th>
            <th className="align-right width-10">
              Yksikkö&shy;hinta (€/kg/kpl)
              <br />
              {invoice.customer.showPriceWithoutTax ? 'ALV 0 %' : 'sis. ALV 14 %'}
            </th>
            <th className="align-right width-10">
              Kokonais&shy;hinta (€)
              <br />
              {invoice.customer.showPriceWithoutTax ? 'ALV 0 %' : 'sis. ALV 14 %'}
            </th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.sort((a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime()).map((item, idx) => (
            <tr key={idx} className="border-bottom">
              <td className="align-left width-20">{formatDate(item.deliveryDate)}</td>
              <td className="align-left width-20">{item.orderNumber}</td>
              <td className="align-left width-20">{item.productName}</td>
              <td className="align-right width-20">{item.quantity}</td>
              {item.usePrice0
                ? (
                    <>
                      <td className="align-right width-10">{formatMoneyFi(item.priceWithoutTax)}</td>
                      <td className="align-right width-10">{formatMoneyFi(item.totalWithoutTax)}</td>
                    </>
                  )
                : (
                    <>
                      <td className="align-right width-10">{formatMoneyFi(item.priceWithTax)}</td>
                      <td className="align-right width-10">{formatMoneyFi(item.totalWithTax)}</td>
                    </>
                  )}
            </tr>
          ))}

          {showTotal && (
            <tr className="border-top border-bottom">
              <td colSpan={3} className="title width-40">
                Yhteensä
                {' '}
                {invoice.customer.showPriceWithoutTax ? '(ALV 0 %)' : '(ALV 14 %)'}
              </td>
              <td className="align-right">{invoice.totals.totalKg}</td>
              <td></td>
              <td className="align-right">
                {invoice.customer.showPriceWithoutTax
                  ? formatMoneyFi(invoice.totals.totalSumWithoutTax)
                  : formatMoneyFi(invoice.totals.totalSumWithTax)}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
