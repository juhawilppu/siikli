import { WarehouseReportRow } from "@/types/types";

export const WarehouseReportByCustomer = ({ reportDate, reportData }: {
    reportDate: Date,
    reportData: WarehouseReportRow[]
}) => {
    function groupBy<T, K extends keyof T>(array: T[], key: K): Record<string, T[]> {
        return array.reduce((result, item) => {
            const group = String(item[key]); // convert key to string for object key
            if (!result[group]) {
                result[group] = [];
            }
            result[group].push(item);
            return result;
        }, {} as Record<string, T[]>);
    }


    const getSum = (rows: WarehouseReportRow[], field: 'amount') => {
        return rows.map(r => r[field]).reduce((a, b) => a + b, 0)
    }

    const groupedByproduct_type = groupBy(reportData, 'product_type');

    return (
        <div>
            <h1 className="md-display-1">Tuotekohtainen pakkauslista</h1>
            <br />
            <b>Raportointipäivä:</b>{' '}
            <span>{new Date(reportDate).toLocaleDateString('fi-FI')}</span>
            <br />
            <br />

            {reportData.length === 0 ? (
                <div>Ei tuotteita.</div>
            ) : (
                <>
                    <table style={{ pageBreakInside: 'auto' }} className="border-bottom">
                        <thead>
                            <tr className="md-subhead border-top">
                                <td className="align-left" style={{ width: '35%' }}>Tuote</td>
                                <td className="align-center" colSpan={2} style={{ width: '15%' }}>Pakkaus</td>
                                <td className="align-right" style={{ width: '20%' }}>Kappaletta</td>
                                <td className="align-right" style={{ width: '30%' }}>Kokonaismäärä (kg)</td>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.map((order, index) => {
                                const current = reportData[index];
                                const next = reportData[index + 1];
                                const addBorder =
                                    !next ||
                                    current.product_variety !== next.product_variety ||
                                    current.product_type !== next.product_type;

                                return (
                                    <tr key={index} className={addBorder ? 'border-bottom' : ''}>
                                        <td className="align-left">{order.product_name}</td>
                                        <td className="align-right">{order.package_size}</td>
                                        <td className="align-left">&nbsp;{order.package_type}</td>
                                        <td className="align-right">{Math.ceil(order.amount / order.package_size)}</td>
                                        <td className="align-right">{order.amount}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <br />
                    <br />
                    <div style={{ pageBreakInside: 'avoid' }}>
                        <b>Yhteensä lajikkeittain</b>
                        <br />
                        <br />
                        <table style={{ pageBreakInside: 'avoid' }} className="border-bottom">
                            <thead>
                                <tr className="md-subhead border-top">
                                    <td className="align-left width-50">Lajike</td>
                                    <td className="align-right width-50">Kokonaismäärä (kg)</td>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(groupedByproduct_type).map(([product_type, products]) => {
                                    const groupedByVariety = groupBy(products, 'product_variety');

                                    return (
                                        <tr key={product_type} className="border-bottom">
                                            <td className="width-50">
                                                {Object.keys(groupedByVariety).map((variety) => (
                                                    <div key={variety}>{variety}</div>
                                                ))}
                                            </td>
                                            <td className="align-right width-50">
                                                {Object.values(groupedByVariety).map((productsOfVariety, i) => (
                                                    <div key={i}>{getSum(productsOfVariety, 'amount')}</div>
                                                ))}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}

export default WarehouseReportByCustomer;
