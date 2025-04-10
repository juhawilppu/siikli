import { Customer } from "@/types/types";
import { formatMoneyFi } from "@/utils/money";
import { FlatOrderItem } from "./Invoices";

export function InvoiceAppendix({
    invoiceRows,
    customer,
    reportData,
    showTotal,
    totalPages,
}: {
    invoiceRows: FlatOrderItem[],
    customer: Customer,
    reportData: any,
    showTotal: boolean,
    totalPages: number
}) {
    const formatDate = (dateStr: Date) => new Date(dateStr).toLocaleDateString('fi-FI');

    return (
        <div className="invoice-appendix show-on-print" style={{ pageBreakBefore: 'always', position: 'relative' }}>
            <table>
                <tbody>
                    <tr>
                        <td className="width-50 align-center vertical-center strong">Aromäen Tila Oy</td>
                        <td className="width-30 vertical-center strong">LASKU FAKTURA</td>
                        <td className="width-20 vertical-center">
                            <span className="page-number" />/{totalPages}
                        </td>
                    </tr>
                </tbody>
            </table>

            <br />

            <table className="border-all">
                <thead>
                    <tr className="md-title border-top border-bottom">
                        <th className="align-left width-10">Toimituspäivä</th>
                        <th className="align-left width-10">Tilausnumero</th>
                        <th className="align-left width-20">Tuotenimike</th>
                        <th className="align-right width-20">Määrä (kg/kpl)</th>
                        <th className="align-right">
                            Yksikköhinta (€/kg/kpl)<br />
                            {customer.show_price_without_tax ? 'ALV 0 %' : 'sis. ALV 14 %'}
                        </th>
                        <th className="align-right">
                            Kokonaishinta (€)<br />
                            {customer.show_price_without_tax ? 'ALV 0 %' : 'sis. ALV 14 %'}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {invoiceRows.sort((a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime()).map((item, idx) => (
                        <tr key={idx} className="border-bottom">
                            <td className="align-left width-10">{formatDate(item.deliveryDate)}</td>
                            <td className="align-left width-10">{item.orderNumber}</td>
                            <td className="align-left width-30">{item.productName}</td>
                            <td className="align-right width-20">{item.amount}</td>
                            {customer.show_price_without_tax ? (
                                <>
                                    <td className="align-right">{formatMoneyFi(item.price0)}</td>
                                    <td className="align-right">{formatMoneyFi(item.amount * item.price0)}</td>
                                </>
                            ) : (
                                <>
                                    <td className="align-right">{formatMoneyFi(item.price)}</td>
                                    <td className="align-right">{formatMoneyFi(item.amount * item.price)}</td>
                                </>
                            )}
                        </tr>
                    ))}

                    {showTotal && (
                        <tr className="border-top border-bottom">
                            <td colSpan={3} className="title width-40">
                                Yhteensä {customer.show_price_without_tax ? '(ALV 0 %)' : '(ALV 14 %)'}
                            </td>
                            <td className="align-right">{reportData.totalKg}</td>
                            <td></td>
                            <td className="align-right">
                                {customer.show_price_without_tax
                                    ? formatMoneyFi(reportData.totalSumWithoutTax)
                                    : formatMoneyFi(reportData.totalSumWithTax)}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}