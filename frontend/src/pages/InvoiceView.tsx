// NOTE: This is a simplified React translation of your Angular invoice layout.
// Some logic (like page numbers, datepickers, etc.) will need additional handling or libraries.

import { Customer } from "@/types/types";

export interface CustomerInvoiceDto {
    longName: string,
    companyName: string,
    businessId: string,
    address: string,
    postalCode: string,
    city: string,
    showPriceWithoutTax: boolean
}

export interface InvoiceDto {
    date: string,
    invoiceId: string,
    paymentCondition: string,
    dueDate: string,
    interestRate: string,
    notificationPeriod: string
}

export function InvoiceView(
    {
        customer,
        invoice,
        reportData,
        isEditMode,
        onChange,
    }: {
        customer: Customer,
        invoice: InvoiceDto,
        reportData: {
            totalPages: number,
            finalSumWithoutTax: number,
            totalTax: number,
            finalSumWithTax: number
        },
        isEditMode: true,
        onChange: any
    }) {
    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('fi-FI');

    return (
        <div className="invoice">
            <table className="show-on-print">
                <tbody>
                    <tr>
                        <td className="width-50 align-center vertical-center strong">Aromäen Tila Oy</td>
                        <td className="width-30 vertical-center strong">LASKU FAKTURA</td>
                        <td className="width-20 vertical-center">
                            <span className="page-number" />/{reportData.totalPages}
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
                            {isEditMode ? (
                                <input type="date" value={invoice.date} onChange={(e) => onChange('date', e.target.value)} />
                            ) : (
                                <span>{formatDate(invoice.date)}</span>
                            )}
                        </td>
                    </tr>
                    <tr>
                        <td>{customer.name}</td>
                        <td className="strong border-left">Laskun numero:</td>
                        <td>
                            {isEditMode ? (
                                <input value={invoice.invoiceId} onChange={(e) => onChange('invoiceId', e.target.value)} />
                            ) : (
                                <span>{invoice.invoiceId}</span>
                            )}
                        </td>
                    </tr>
                    <tr>
                        <td>{customer.company_name}</td>
                        <td className="strong border-left">Maksuehdot:</td>
                        <td>
                            {isEditMode ? (
                                <input value={invoice.paymentCondition} onChange={(e) => onChange('paymentCondition', e.target.value)} />
                            ) : (
                                <span>{invoice.paymentCondition}</span>
                            )}
                        </td>
                    </tr>
                    <tr>
                        <td>{customer.business_id ? `Y-tunnus ${customer.business_id}` : customer.address}</td>
                        <td className="strong border-left">Eräpäivä:</td>
                        <td>
                            {isEditMode ? (
                                <input type="date" value={invoice.dueDate} onChange={(e) => onChange('dueDate', e.target.value)} />
                            ) : (
                                <span>{formatDate(invoice.dueDate)}</span>
                            )}
                        </td>
                    </tr>
                    <tr>
                        <td>{customer.business_id ? customer.address : `${customer.postal_code} ${customer.city}`}</td>
                        <td className="strong border-left">Viivästyskorko:</td>
                        <td>
                            {isEditMode ? (
                                <input value={invoice.interestRate} onChange={(e) => onChange('interestRate', e.target.value)} />
                            ) : (
                                <span>{invoice.interestRate}</span>
                            )}
                        </td>
                    </tr>
                    <tr>
                        <td>{customer.business_id && `${customer.postal_code} ${customer.city}`}</td>
                        <td className="strong border-left">Huomautusaika:</td>
                        <td>
                            {isEditMode ? (
                                <input value={invoice.notificationPeriod} onChange={(e) => onChange('notificationPeriod', e.target.value)} />
                            ) : (
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
                        <td className="strong">Yhteensä (ALV 0 %)</td>
                        <td></td>
                        <td className="align-right">{reportData.finalSumWithoutTax.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td className="strong">ALV 14 %</td>
                        <td></td>
                        <td className="align-right">{reportData.totalTax.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td className="strong">Yhteensä (ALV 14 %)</td>
                        <td></td>
                        <td className="align-right">{reportData.finalSumWithTax.toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
