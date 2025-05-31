import type { PackagingListGroupedByProduct } from '@/types/types'
import '../App.css'
import { formatNumberForUi } from './NewCustomer'

export function PackagingListByProduct({ report }: {
  report: PackagingListGroupedByProduct
}) {
  function groupBy<T, K extends keyof T>(array: T[], key: K): Record<string, T[]> {
    return array.reduce((result, item) => {
      const group = String(item[key]) // convert key to string for object key
      if (!result[group]) {
        result[group] = []
      }
      result[group].push(item)
      return result
    }, {} as Record<string, T[]>)
  }

  const getSum = (rows: any[], field: 'amount') => {
    return rows.map(r => r[field]).reduce((a, b) => a + b, 0)
  }

  const groupedByproduct_type = groupBy(report.rows, 'productType')

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
                    <td className="align-center" colSpan={2} style={{ width: '15%' }}>Pakkaus</td>
                    <td className="align-right" style={{ width: '20%' }}>Kappaletta</td>
                    <td className="align-right" style={{ width: '30%' }}>Kokonaismäärä (kg)</td>
                  </tr>
                </thead>
                <tbody>
                  {report.rows.map((order, index) => {
                    const current = report.rows[index]
                    const next = report.rows[index + 1]
                    const addBorder
                    = !next
                      || current.productVariety !== next.productVariety
                      || current.productType !== next.productType

                    return (
                      <tr key={index} className={addBorder ? 'border-bottom' : ''}>
                        <td className="align-left">{order.productName}</td>
                        <td className="align-right">{order.packageSize}</td>
                        <td className="align-left">
                        &nbsp;
                          {order.packageType}
                        </td>
                        <td className="align-right">{formatNumberForUi(order.amount / order.packageSize)}</td>
                        <td className="align-right">{formatNumberForUi(order.amount)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {false && (
                <>
                  <br />
                  <br />
                  <div style={{ pageBreakInside: 'avoid' }}>
                    <b>Yhteensä lajikkeittain</b>
                    <br />
                    <br />
                    <table style={{ pageBreakInside: 'avoid' }} className="border-bottom">
                      <thead>
                        <tr className="title border-top border-bottom">
                          <td className="align-left width-50">Lajike</td>
                          <td className="align-right width-50">Kokonaismäärä (kg)</td>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(groupedByproduct_type).map(([product_type, products]) => {
                          const groupedByVariety = groupBy(products, 'productVariety')

                          return (
                            <tr key={product_type} className="border-bottom">
                              <td className="width-50">
                                {Object.keys(groupedByVariety).map(variety => (
                                  <div key={variety}>{variety}</div>
                                ))}
                              </td>
                              <td className="align-right width-50">
                                {Object.values(groupedByVariety).map((productsOfVariety, i) => (
                                  <div key={i}>{getSum(productsOfVariety, 'amount')}</div>
                                ))}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          )}
    </div>
  )
}

export default PackagingListByProduct
