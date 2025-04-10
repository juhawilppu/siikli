import { WarehouseReportByCustomer, WarehouseReportByCustomerRow } from "@/types/types";

export const WarehouseReportByCustomerDocument = ({ report }: {
    report: WarehouseReportByCustomer
}) => {

    const groupByCustomerName = (orders: WarehouseReportByCustomerRow[]): Record<string, WarehouseReportByCustomerRow[]> => {
        return orders.reduce((acc, order) => {
            if (!acc[order.customerName]) {
                acc[order.customerName] = []
            }
            acc[order.customerName].push(order)
            return acc
        }, {} as Record<string, WarehouseReportByCustomerRow[]>)
    }

    const groupedData = groupByCustomerName(report.rows)

    return (
        <div className="pdf">
            <h1 className="md-display-1">Kauppakohtainen pakkauslista</h1>
            <br />
            <b>Raportointipäivä:</b>{' '}
            <span>{report.deliveryDate}</span>

            {!report.rows && <div>Ei tuotteita.</div>}

            {Object.entries(groupedData).map(([customerName, rows]) => (
                <div className="module" key={customerName}>
                    <h2 className="align-center no-page-break-after">{customerName}</h2>
                    <table className="border-bottom">
                        <thead>
                            <tr className="title border-top border-bottom">
                                <td className="align-left" style={{ width: '30%' }}>
                                    Tuote
                                </td>
                                <td className="align-center" colSpan={2} style={{ width: '10%' }}>
                                    Pakkaus
                                </td>
                                <td className="align-right" style={{ width: '10%' }}>
                                    Kappaletta
                                </td>
                                <td className="align-right" style={{ width: '25%' }}>
                                    Kokonaismäärä (kg)
                                </td>
                                <td className="align-left" style={{ width: '25%' }}>
                                    Lisätietoa
                                </td>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((order, idx) => (
                                <tr key={idx}>
                                    <td className="align-left">{order.productName}</td>
                                    <td className="align-right">{order.packageSize}</td>
                                    <td className="align-left">{order.packageType}</td>
                                    <td className="align-right">
                                        {Math.ceil(order.amount / order.packageSize)}
                                    </td>
                                    <td className="align-right">{order.amount}</td>
                                    <td className="align-left">{order.freetext}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    );
}

export default WarehouseReportByCustomerDocument