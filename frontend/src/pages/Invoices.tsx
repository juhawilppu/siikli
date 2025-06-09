import type { GetCustomerRequestDto, GetCustomersResponseDto, GetInvoiceResponseDto } from '@/types/types'
import axios from 'axios'
import { endOfMonth, startOfMonth } from 'date-fns'
import { fi } from 'date-fns/locale'

import { Calendar, RefreshCw } from 'lucide-react'
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

export interface FlatOrderItem {
  deliveryDate: Date
  orderId: string
  orderNumber: number
  productName: string
}

export function Invoices() {
  const [customers, setCustomers] = useState<GetCustomerRequestDto[]>()
  const [invoice, setInvoice] = useState<GetInvoiceResponseDto>()
  const [loading, setLoading] = useState(true)
  const [printing, setPrinting] = useState(false)
  const [startDate, setStartDate] = useState<Date | undefined>(
    startOfMonth(new Date(new Date().setMonth(new Date().getMonth() - 1))),
  )
  const [endDate, setEndDate] = useState<Date | undefined>(
    endOfMonth(new Date(new Date().setMonth(new Date().getMonth() - 1))),
  )

  const [customerId, setCustomerId] = useState<string>()
  const [openStartDate, setOpenStartDate] = useState(false)
  const [openEndDate, setOpenEndDate] = useState(false)
  const [dirty, setDirty] = useState(true)

  const getData = async () => {
    setDirty(false)
    setInvoice(undefined)

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
    try {
      const invoice = await axios.get<GetInvoiceResponseDto>('/invoices', {
        params: {
          customerId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          preview: 'true',
        },
      })
      console.log('invoice', invoice.data)
      setInvoice(invoice.data)
    }
    catch (error: any) {
      if (error.response?.data?.error === 'No items found') {
        toast({
          title: 'Ei tilauksia',
          description: 'Tällä asiakkaalla ei ole tilauksia tällä aikavälillä',
        })
      }
      else {
        toast({
          title: 'Jokin meni pieleen',
          description: 'Tarkista, että aloitus- ja lopetuspäivät ovat oikein',
        })
      }
    }
  }

  const printInvoice = async () => {
    if (!startDate || !endDate || !customers) {
      return
    }
    setPrinting(true)

    console.log('printInvoice', customerId, startDate, endDate)
    const response = await axios.get('/invoices', {
      params: {
        customerId,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        preview: 'false',
      },
      responseType: 'blob',
    })

    // Create blob URL
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)

    // Create temporary link and trigger download
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `lasku-${customers.find(c => c.id === customerId)?.name.toLowerCase().replace(' ', '-')}-${formatDate(new Date())}.pdf`)
    document.body.appendChild(link)
    link.click()

    // Cleanup
    link.remove()
    window.URL.revokeObjectURL(url)
    setPrinting(false)
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
    return <div>Ei Asiakkaita</div>

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
              <Select
                value={customerId}
                onValueChange={(value) => {
                  setCustomerId(value)
                  setDirty(true)
                  setInvoice(undefined)
                }}
              >
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
              <Popover open={openStartDate} onOpenChange={setOpenStartDate}>
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
                    onSelect={(date) => {
                      setStartDate(date)
                      setDirty(true)
                      setInvoice(undefined)
                      setOpenStartDate(false)
                    }}
                    required
                    initialFocus
                    locale={fi}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Loppupäivä</label>
              <Popover open={openEndDate} onOpenChange={setOpenEndDate}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {endDate ? formatDate(endDate) : <span>Select date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => {
                      setEndDate(date)
                      setDirty(true)
                      setInvoice(undefined)
                      setOpenEndDate(false)
                    }}
                    required
                    locale={fi}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex justify-end items-end gap-2">
              <Button variant="outline" disabled={!dirty || !customerId || !startDate || !endDate} onClick={getData}>
                <RefreshCw className="w-4 h-4 mr-2" />
                {' '}
                Esikatselu
              </Button>
              <Button disabled={!customerId || !startDate || !endDate || printing} onClick={printInvoice}>
                <RefreshCw className="w-4 h-4 mr-2" />
                {' '}
                Tulosta
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {invoice && (
        <Card className="p-5">
          <div>
            <strong>Esikatselu</strong>
            <p>
              Yhteensä:
              {' '}
              {invoice.total}
              {' '}
              €
            </p>
          </div>
        </Card>
      )}
    </SiikliPage>
  )
}
