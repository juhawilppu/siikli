import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CustomerDto, GetCustomersResponseDto, InvoiceDto } from '@/types/types'
import { formatDate } from '@/utils/date'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import axios from 'axios'
import { endOfMonth, startOfMonth } from 'date-fns'
import { fi } from "date-fns/locale"
import { Calendar, Printer, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { InvoiceAppendix } from './InvoiceAppendix'
import { InvoiceView } from './InvoiceView'

export interface FlatOrderItem {
    deliveryDate: Date;
    orderId: string;
    orderNumber: number;
    productName: string;
}

const now = new Date()

export const Invoices = () => {
    const [customers, setCustomers] = useState<CustomerDto[]>()
    const [invoice, setInvoice] = useState<InvoiceDto>()
    const [loading, setLoading] = useState(true)
    const [startDate, setStartDate] = useState<Date | undefined>(
        startOfMonth(now)
    )
    const [endDate, setEndDate] = useState<Date | undefined>(
        endOfMonth(now)
    )

    const [customerId, setCustomerId] = useState<string>()

    const getData = async () => {
        if (!startDate || !endDate) {
            return
        }
        const invoice = await axios.get<InvoiceDto>('/invoices', {
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
            .get<GetCustomersResponseDto>('/customers')
            .then((response) => setCustomers(response.data.customers))
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <div>Loading</div>
    if (!customers) return <div>Ei tuotteita</div>

    const selectedCustomer = customers.find(c => c.id == customerId)

    return (
        <>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Laskut</h1>
                    <p className="text-muted-foreground">Tällä sivulla voit tulostaa laskut.</p>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Hakuehdot</CardTitle>
                        <CardDescription>Suodata tilauksia päivämäärän mukaan</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-4">
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
                                {selectedCustomer && selectedCustomer.streetAddress && selectedCustomer.postalCode && selectedCustomer.city && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {selectedCustomer.streetAddress}, {selectedCustomer.postalCode} {selectedCustomer.city}
                                    </p>
                                )}
                            </div>
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
                                            required
                                            initialFocus
                                            locale={fi}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Loppupäivä</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                                            <Calendar className="mr-2 h-4 w-4" />
                                            {endDate ? formatDate(endDate) : <span>Select date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <CalendarComponent mode="single" selected={endDate} onSelect={setEndDate} required locale={fi} />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="flex justify-end items-end gap-2">
                                <Button onClick={getData}><RefreshCw className="w-4 h-4 mr-2" /> Hae tiedot</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                {invoice && (
                    <Card className="p-5">
                        <div className="flex justify-end items-end">
                            <Button disabled={!invoice} onClick={print}><Printer className="w-4 h-4 mr-2" /> Tulosta</Button>
                        </div>
                        <div className="pdf p-5">
                            <InvoiceView invoice={invoice} reportData={
                                {
                                    totalPages: 1,
                                }
                            } isEditMode={true} onChange={() => { }} />
                            <InvoiceAppendix
                                invoice={invoice}
                                showTotal={true}
                                totalPages={1}
                            />
                        </div>
                    </Card>
                )}
            </div>
        </>
    )
}
