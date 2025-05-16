import type { InvoiceDto } from '@/types/types'
import { formatMoneyFi } from '@/utils/money'

export interface CustomerInvoiceDto {
  longName: string
  companyName: string
  businessId: string
  address: string
  postalCode: string
  city: string
  showPriceWithoutTax: boolean
}

export function InvoiceView(
  {
    invoice,
    reportData,
    isEditMode,
    onChange,
  }: {
    invoice: InvoiceDto
    reportData: {
      totalPages: number
    }
    isEditMode: true
    onChange: any
  },
) {
  return (
    <div className="space-y-5">
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
              {reportData.totalPages}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Billing and receiver info */}
      <table className="border-all">
        <tbody>
          <tr>
            <td className="strong width-50">Laskun saaja</td>
            <td className="strong width-25 border-left">Päivämäärä:</td>
            <td className="width-25">
              {isEditMode
                ? (
                    <input type="date" value={invoice.date} onChange={e => onChange('date', e.target.value)} />
                  )
                : (
                    <span>{invoice.date}</span>
                  )}
            </td>
          </tr>
          <tr>
            <td>
              {invoice.customer.chain}
              {' '}
              {invoice.customer.name}
            </td>
            <td className="strong border-left">Laskun numero:</td>
            <td>
              {isEditMode
                ? (
                    <input value={invoice.invoiceId} onChange={e => onChange('invoiceId', e.target.value)} />
                  )
                : (
                    <span>{invoice.invoiceId}</span>
                  )}
            </td>
          </tr>
          <tr>
            <td>{invoice.customer.companyName}</td>
            <td className="strong border-left">Maksuehdot:</td>
            <td>
              {isEditMode
                ? (
                    <input value={invoice.paymentCondition} onChange={e => onChange('paymentCondition', e.target.value)} />
                  )
                : (
                    <span>{invoice.paymentCondition}</span>
                  )}
            </td>
          </tr>
          <tr>
            <td>{invoice.customer.businessId ? `Y-tunnus ${invoice.customer.businessId}` : invoice.customer.address}</td>
            <td className="strong border-left">Eräpäivä:</td>
            <td>
              {isEditMode
                ? (
                    <input type="date" value={invoice.dueDate} onChange={e => onChange('dueDate', e.target.value)} />
                  )
                : (
                    <span>{invoice.dueDate}</span>
                  )}
            </td>
          </tr>
          <tr>
            <td>{invoice.customer.businessId ? invoice.customer.address : `${invoice.customer.postalCode || ''} ${invoice.customer.city || ''}`}</td>
            <td className="strong border-left">Viivästyskorko:</td>
            <td>
              {isEditMode
                ? (
                    <input value={invoice.interestRate} onChange={e => onChange('interestRate', e.target.value)} />
                  )
                : (
                    <span>{invoice.interestRate}</span>
                  )}
            </td>
          </tr>
          <tr>
            <td>{invoice.customer.businessId && `${invoice.customer.postalCode} ${invoice.customer.city}`}</td>
            <td className="strong border-left">Huomautusaika:</td>
            <td>
              {isEditMode
                ? (
                    <input value={invoice.notificationPeriod} onChange={e => onChange('notificationPeriod', e.target.value)} />
                  )
                : (
                    <span>{invoice.notificationPeriod}</span>
                  )}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Additional sections would follow in the same structured format */}

      {/* Totals section */}
      <table className="border-all">
        <tbody>
          <tr>
            <td className="width-50 strong">Yhteensä (ALV 0 %)</td>
            <td className="width-50 align-right">{formatMoneyFi(invoice.totals.finalSumWithoutTax)}</td>
          </tr>
          <tr>
            <td className="width-50 strong">ALV 14 %</td>
            <td className="width-50 align-right">{formatMoneyFi(invoice.totals.totalTax)}</td>
          </tr>
          <tr>
            <td className="width-50 strong">Yhteensä (ALV 14 %)</td>
            <td className="width-50 align-right">{formatMoneyFi(invoice.totals.finalSumWithTax)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
