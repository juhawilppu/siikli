import { Invoice, Order, OrderProduct } from '@/types/types'
import { Button, FormControl, InputLabel, LinearProgress, MenuItem, Select, SelectChangeEvent } from '@mui/material'
import { DatePicker, fiFI, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import axios from 'axios'
import moment, { Moment } from 'moment'
import { useEffect, useState } from 'react'
import { SideBySide } from '../components'
import { InvoiceAppendix } from './InvoiceAppendix'
import { InvoiceView } from './InvoiceView'
import { CustomerDto } from './Order/Order'

export interface FlatOrderItem extends OrderProduct {
    deliveryDate: Date;
    orderId: number;
    orderNumber: number;
    productName: string;
}

export const Invoices = () => {
    const [customers, setCustomers] = useState<any>()
    const [invoice, setInvoice] = useState<Invoice>()
    const [loading, setLoading] = useState(true)
    const [startDate, setStartDate] = useState<Moment>(
        moment().clone().weekday(1)
    )
    const [endDate, setEndDate] = useState(
        moment().clone().weekday(1).add(7, 'day')
    )

    const handleStartDateChange = (value: Moment | null) => {
        if (value) setStartDate(value)
    }

    const handleEndDateChange = (value: Moment | null) => {
        if (value) setEndDate(value)
    }

    const [customerId, setCustomerId] = useState<number>(20)

    const handleCustomerChange = (event: SelectChangeEvent) => {
        setCustomerId(parseInt(event.target.value))
    }

    const getData = async () => {
        const invoice = await axios.get('/invoices', {
            params: {
                customerId,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
            }
        })
        console.log('invoice', invoice.data)
        setInvoice(invoice.data)

    }

    useEffect(() => {
        axios
            .get('/customers')
            .then((response) => setCustomers(response.data))
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <LinearProgress />
    if (!customers) return <div>Ei tuotteita</div>

    function flattenOrderProducts(orders: Order[]): FlatOrderItem[] {
        return orders.flatMap(order =>
            order.products.map(product => ({
                ...product,
                productName: 'siikli',
                deliveryDate: new Date(order.deliveryDate),
                orderId: order.id,
                orderNumber: 100
            }))
        );
    }

    return (
        <>
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Laskut</h1>
                <p className="text-muted-foreground">Tällä sivulla voit tulostaa laskut.</p>
            </div>
            <FormControl fullWidth>
                <InputLabel id='order-customer'>Asiakas</InputLabel>
                <Select
                    labelId='order-customer'
                    id='order-customer'
                    value={customerId ? customerId + '' : ''}
                    label='Asiakas'
                    onChange={handleCustomerChange}
                >
                    {customers.map((customer: CustomerDto) => (
                        <MenuItem key={customer.id} value={customer.id}>
                            {customer.chain} {customer.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <SideBySide>
                <LocalizationProvider
                    dateAdapter={AdapterMoment}
                    adapterLocale='fi'
                    localeText={
                        fiFI.components.MuiLocalizationProvider.defaultProps.localeText
                    }
                >
                    <DatePicker
                        format='DD.MM.YYYY'
                        label='Aloitus'
                        value={startDate}
                        onChange={handleStartDateChange}
                    />
                </LocalizationProvider>
                <LocalizationProvider
                    dateAdapter={AdapterMoment}
                    adapterLocale='fi'
                    localeText={
                        fiFI.components.MuiLocalizationProvider.defaultProps.localeText
                    }
                >
                    <DatePicker
                        format='DD.MM.YYYY'
                        label='Lopetus'
                        value={endDate}
                        onChange={handleEndDateChange}
                    />
                </LocalizationProvider>
            </SideBySide>

            <Button onClick={getData}>Hae tiedot</Button>
            <Button onClick={print}>Tulosta</Button>
            <div>
                {invoice && <InvoiceView customer={invoice.customer} invoice={{
                    date: '5.4.2025',
                    invoiceId: '1001',
                    paymentCondition: '14 pv',
                    dueDate: '19.5.2025',
                    interestRate: '7 %',
                    notificationPeriod: '14',
                }} reportData={
                    {
                        totalPages: 1,
                        finalSumWithoutTax: 200,
                        finalSumWithTax: 100,
                        totalTax: 100
                    }
                } isEditMode={true} onChange={() => { }}></InvoiceView>}
                {invoice &&
                    <InvoiceAppendix
                        invoiceRows={flattenOrderProducts(invoice.orders)}
                        customer={invoice.customer}
                        reportData={
                            {
                                totalPages: 1,
                                finalSumWithoutTax: 200,
                                totalSumWithTax: 100,
                                finalSumWithTax: 100,
                                totalTax: 100
                            }
                        }
                        showTotal={true}
                        totalPages={1}
                    />}
            </div>
        </>
    )
}
