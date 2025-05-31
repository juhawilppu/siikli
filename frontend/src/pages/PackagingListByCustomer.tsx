import type { PackagingListGroupedByCustomer } from '@/types/types'
import { formatNumberForUi } from './NewCustomer'

export function PackagingListByCustomer({ report }: {
  report: PackagingListGroupedByCustomer
}) {
  const groupByCustomerName = (orders: PackagingListGroupedByCustomer['rows']): Record<string, PackagingListGroupedByCustomer['rows']> => {
    return orders.reduce((acc, order) => {
      if (!acc[order.customerName]) {
        acc[order.customerName] = []
      }
      acc[order.customerName].push(order)
      return acc
    }, {} as Record<string, PackagingListGroupedByCustomer['rows']>)
  }

  const groupedData = groupByCustomerName(report.rows)

  return (
    <div className="pdf">
      <h1>Kauppakohtainen pakkauslista</h1>
      <br />
      <b>Päivämäärä:</b>
      {' '}
      <span>{report.deliveryDate}</span>

      {!report.rows && <div>Ei tuotteita.</div>}

      {Object.entries(groupedData).map(([customerName, rows]) => (
        <div className="module" key={customerName}>
          <h2 className="align-center no-page-break-after">{customerName}</h2>
          <table className="border-bottom">
            <thead>
              <tr className="title border-top border-bottom">
                <td className="align-left" style={{ width: '20%' }}>
                  Tuote
                </td>
                <td className="align-center" style={{ width: '15%' }}>
                  Pakkaus
                </td>
                <td className="align-right" style={{ width: '15%' }}>
                  Kappa&shy;letta
                </td>
                <td className="align-right" style={{ width: '25%' }}>
                  Kokonais&shy;määrä (kg)
                </td>
                <td className="align-left" style={{ width: '25%' }}>
                  Lisä&shy;tietoa
                </td>
              </tr>
            </thead>
            <tbody>
              {rows.map((order, idx) => (
                <tr key={idx}>
                  <td className="align-left" style={{ width: '20%' }}>{order.productName}</td>
                  <td className="align-center" style={{ width: '15%' }}>
                    {order.packageSize}
                    {' '}
                    {order.packageType}
                  </td>
                  <td className="align-right" style={{ width: '15%' }}>
                    {formatNumberForUi(order.amount / order.packageSize)}
                  </td>
                  <td className="align-right" style={{ width: '25%' }}>{formatNumberForUi(order.amount)}</td>
                  <td className="align-left" style={{ width: '25%' }}>{order.freetext}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}

export default PackagingListByCustomer
