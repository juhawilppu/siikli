import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Invoice, Order, OrderProduct } from '@/types/types'
import { formatDate } from '@/utils/date'
import { Button, FormControl, InputLabel, LinearProgress, MenuItem, Select, SelectChangeEvent } from '@mui/material'
import axios from 'axios'
import { endOfWeek, startOfWeek } from 'date-fns'
import { fi } from "date-fns/locale"
import { Calendar } from 'lucide-react'
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

const now = new Date()

export const Invoices = () => {
    const [customers, setCustomers] = useState<any>()
    const [invoice, setInvoice] = useState<Invoice>()
    const [loading, setLoading] = useState(true)
    const [startDate, setStartDate] = useState<Date>(
        startOfWeek(now, { weekStartsOn: 1 })
    )
    const [endDate, setEndDate] = useState<Date>(
        endOfWeek(now, { weekStartsOn: 1 })
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
                <div className="space-y-2">
                    <label className="text-sm font-medium">Alkupäivä</label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                                <Calendar className="mr-2 h-4 w-4" />
                                {startDate ? formatDate(startDate) : <span>Select date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <CalendarComponent
                                mode="single"
                                selected={startDate}
                                onSelect={setStartDate}
                                initialFocus
                                locale={fi}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
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
