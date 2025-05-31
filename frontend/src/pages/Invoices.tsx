import type { GetCustomersResponseDto, InvoiceDto, GetCustomerRequestDto } from '@/types/types'
import axios from 'axios'
import { endOfMonth, startOfMonth } from 'date-fns'
import { fi } from 'date-fns/locale'

import { Calendar, Printer, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import SiikliPage from '@/SiikliPage'
import { formatDate } from '@/utils/date'
import { InvoiceAppendix } from './InvoiceAppendix'
import { InvoiceView } from './InvoiceView'

export interface FlatOrderItem {
  deliveryDate: Date
  orderId: string
  orderNumber: number
  productName: string
}

export function Invoices() {
  const [customers, setCustomers] = useState<GetCustomerRequestDto[]>()
  const [invoice, setInvoice] = useState<InvoiceDto>()
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState<Date | undefined>(
    startOfMonth(new Date(new Date().setMonth(new Date().getMonth() - 1))),
  )
  const [endDate, setEndDate] = useState<Date | undefined>(
    endOfMonth(new Date(new Date().setMonth(new Date().getMonth() - 1))),
  )

  const [customerId, setCustomerId] = useState<string>()

  const getData = async () => {
    if (!customerId) {
      toast({
        title: 'Valitse asiakas',
        description: 'Valitse asiakas, jonka laskut haluat tulostaa',
        variant: 'destructive',
      })
      return
    }
    if (!startDate || !endDate) {
      return
    }
    const invoice = await axios.get<InvoiceDto>('/invoices', {
      params: {
        customerId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    })
    console.log('invoice', invoice.data)
    setInvoice(invoice.data)
  }

  useEffect(() => {
    axios
      .get<GetCustomersResponseDto>('/customers')
      .then(response => setCustomers(response.data.customers))
      .finally(() => setLoading(false))
  }, [])

  if (loading)
    return <SiikliPage title="Laskut" description="Tällä sivulla voit tulostaa laskut" />
  if (!customers)
    return <div>Ei tuotteita</div>

  const selectedCustomer = customers.find(c => c.id === customerId)

  return (
    <SiikliPage title="Laskut" description="Tällä sivulla voit tulostaa laskut">
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
                  {customers.map(customer => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCustomer && selectedCustomer.streetAddress && selectedCustomer.postalCode && selectedCustomer.city && (
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedCustomer.streetAddress}
                  ,
                  {' '}
                  {selectedCustomer.postalCode}
                  {' '}
                  {selectedCustomer.city}
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
              <Button onClick={getData}>
                <RefreshCw className="w-4 h-4 mr-2" />
                {' '}
                Hae tiedot
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {invoice && (
        <Card className="p-5">
          <div className="flex justify-end items-end">
            <Button disabled={!invoice} onClick={print}>
              <Printer className="w-4 h-4 mr-2" />
              {' '}
              Tulosta
            </Button>
          </div>
          <div className="pdf p-5">
            <InvoiceView
              invoice={invoice}
              reportData={
                {
                  totalPages: 1,
                }
              }
              isEditMode={true}
              onChange={() => { }}
            />
            <InvoiceAppendix
              invoice={invoice}
              showTotal={true}
              totalPages={1}
            />
          </div>
        </Card>
      )}
    </SiikliPage>
  )
}
