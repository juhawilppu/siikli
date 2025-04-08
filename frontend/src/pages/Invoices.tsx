import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Invoice, Order, OrderProduct } from '@/types/types'
import { formatDate } from '@/utils/date'

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import axios from 'axios'
import { endOfWeek, startOfWeek } from 'date-fns'
import { fi } from "date-fns/locale"
import { Calendar } from 'lucide-react'
import { useEffect, useState } from 'react'
import { SideBySide } from '../components'
import { InvoiceAppendix } from './InvoiceAppendix'
import { InvoiceView } from './InvoiceView'

export interface FlatOrderItem extends OrderProduct {
    deliveryDate: Date;
    orderId: string;
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

    if (loading) return <div>Loading</div>
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
            <div className="space-y-2">
                <Label htmlFor="customer">Asiakas</Label>
                <Select value={customerId} onValueChange={setCustomerId}>
                    <SelectTrigger id="customer">
                        <SelectValue placeholder="Valitse asiakas" />
                    </SelectTrigger>
                    <SelectContent>
                        {customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                                {customer.chain} {customer.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {selectedCustomer && (
                    <p className="text-xs text-muted-foreground mt-1">
                        {selectedCustomer.streetAddress}, {selectedCustomer.postalCode} {selectedCustomer.city}
                    </p>
                )}
            </div>
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
