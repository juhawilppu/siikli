import { InvoiceDto } from "@/types/types";
import { formatMoneyFi } from "@/utils/money";

export function InvoiceAppendix({
    invoice,
    showTotal,
    totalPages,
}: {
    invoice: InvoiceDto,
    showTotal: boolean,
    totalPages: number
}) {
    const formatDate = (dateStr: Date) => new Date(dateStr).toLocaleDateString('fi-FI');

    return (
        <div className="invoice-appendix show-on-print" style={{ pageBreakBefore: 'always', position: 'relative' }}>
            <table>
                <tbody>
                    <tr>
                        <td className="width-50 strong">{invoice.company.name}</td>
                        <td className="width-30 strong">LASKU FAKTURA</td>
                        <td className="width-20 align-right">
                            Sivu <span className="page-number" />/{totalPages}
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
                            {invoice.customer.showPriceWithoutTax ? 'ALV 0 %' : 'sis. ALV 14 %'}
                        </th>
                        <th className="align-right">
                            Kokonaishinta (€)<br />
                            {invoice.customer.showPriceWithoutTax ? 'ALV 0 %' : 'sis. ALV 14 %'}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {invoice.items.sort((a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime()).map((item, idx) => (
                        <tr key={idx} className="border-bottom">
                            <td className="align-left width-10">{formatDate(item.deliveryDate)}</td>
                            <td className="align-left width-10">{item.orderNumber}</td>
                            <td className="align-left width-30">{item.productName}</td>
                            <td className="align-right width-20">{item.amount}</td>
                            {invoice.customer.showPriceWithoutTax ? (
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
                                Yhteensä {invoice.customer.showPriceWithoutTax ? '(ALV 0 %)' : '(ALV 14 %)'}
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
    );
}