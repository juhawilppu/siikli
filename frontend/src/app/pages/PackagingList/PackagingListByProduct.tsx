import type { PackagingListGroupedByProduct } from '@siikli/shared'
import { formatNumber } from '@siikli/shared'

export function PackagingListByProduct({ report }: {
  report: PackagingListGroupedByProduct
}) {
  return (
    <div className="pdf">
      <h1>Tuotekohtainen pakkauslista</h1>
      <br />
      <b>Päivämäärä:</b>
      {' '}
      <span>{new Date(report.deliveryDate).toLocaleDateString('fi-FI')}</span>
      <br />
      <br />

      {report.rows.length === 0
        ? (
            <div>Ei tuotteita.</div>
          )
        : (
            <>
              <table style={{ pageBreakInside: 'auto' }} className="border-bottom">
                <thead>
                  <tr className="title border-top border-bottom">
                    <td className="align-left" style={{ width: '35%' }}>Tuote</td>
                    <td className="align-center" style={{ width: '15%' }} colSpan={2}>Pakkaus</td>
                    <td className="align-right pl-5" style={{ width: '20%' }}>Kappaletta</td>
                    <td className="align-right pl-5" style={{ width: '30%' }}>Kokonaismäärä (kg)</td>
                  </tr>
                </thead>
                <tbody>
                  {report.rows.map((order, index) => {
                    return (
                      <tr key={index}>
                        <td className="align-left">{order.productName}</td>
                        <td className="align-right" style={{ width: '7.5%' }}>
                          {order.packageSize}
                        </td>
                        <td className="align-left" style={{ width: '7.5%' }}>
                          {order.packageType}
                        </td>
                        <td className="align-right pl-5">{formatNumber(order.amount.div(order.packageSize))}</td>
                        <td className="align-right pl-5">{formatNumber(order.amount)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </>
          )}
    </div>
  )
}

export default PackagingListByProduct
