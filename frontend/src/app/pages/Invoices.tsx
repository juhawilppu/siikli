import type { GetCustomerRequestDto, GetCustomersResponseDto } from '@/app/types/types'
import axios from 'axios'
import { fi } from 'date-fns/locale'

import { Calendar, Check, Eye } from 'lucide-react'
import { useEffect, useState } from 'react'
import SiikliPage from '@/app/components/SiikliPage'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { toast } from '../hooks/use-toast'
import { dateToIso, formatDate } from '../utils/date'

export interface FlatOrderItem {
  deliveryDate: Date
  orderId: string
  orderNumber: number
  productName: string
}

function renderInvoiceStatus(status: 'PENDING' | 'PAID') {
  return <Badge className={cn(status === 'PAID' ? 'bg-green-500' : 'bg-gray-500')}>{status === 'PAID' ? 'Maksettu' : 'Odottaa maksua'}</Badge>
}

export function Invoices() {
  const [customers, setCustomers] = useState<GetCustomerRequestDto[]>()
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState<Date>(
    new Date(new Date().getFullYear(), 0, 1), // January 1st of current year
  )
  const [endDate, setEndDate] = useState<Date>(
    new Date(new Date().getFullYear(), 11, 31), // December 31st of current year
  )

  const [customerId, setCustomerId] = useState<string>()
  const [openStartDate, setOpenStartDate] = useState(false)
  const [openEndDate, setOpenEndDate] = useState(false)

  useEffect(() => {
    axios
      .get<GetCustomersResponseDto>('/customers')
      .then(response => setCustomers(response.data.customers))
      .finally(() => setLoading(false))

    axios
      .get<any[]>('/invoices/list', {
        params: {
          customerId,
          startDate: dateToIso(startDate),
          endDate: dateToIso(endDate),
        },
      })
      .then(response => setInvoices(response.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading)
    return <SiikliPage title="Laskut" description="Tällä sivulla voit tarkastella laskuja" />

  if (!customers)
    return <div>Ei Asiakkaita</div>

  return (
    <SiikliPage title="Laskut" description="Tällä sivulla voit tarkastella laskuja">
      <Card>
        <CardHeader>
          <CardTitle>Hakuehdot</CardTitle>
          <CardDescription className="text-gray-700">Suodata tilauksia päivämäärän mukaan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 w-full md:flex-row">
            <div className="space-y-2 flex-1">
              <Label htmlFor="customer">Asiakas</Label>
              <Select
                value={customerId}
                onValueChange={(value) => {
                  setCustomerId(value)
                }}
              >
                <SelectTrigger id="customer" className="w-full truncate">
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
            </div>
            <div className="space-y-2 flex-1">
              <label className="text-sm font-medium">Alkupäivä</label>
              <Popover open={openStartDate} onOpenChange={setOpenStartDate}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {startDate ? formatDate(startDate) : <span>Valitse päivä</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    defaultMonth={startDate}
                    onSelect={(date) => {
                      setStartDate(date ?? new Date())
                      setOpenStartDate(false)
                    }}
                    required
                    initialFocus
                    locale={fi}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2 flex-1">
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
                    defaultMonth={endDate}
                    onSelect={(date) => {
                      setEndDate(date ?? new Date())
                      setOpenEndDate(false)
                    }}
                    required
                    locale={fi}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Laskut</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead>
                <tr className="border-b">
                  <th className="h-12 px-4 text-left align-middle">Laskun numero</th>
                  <th className="h-12 px-4 text-left align-middle">Asiakas</th>
                  <th className="h-12 px-4 text-left align-middle">Tila</th>
                  <th className="h-12 px-4 text-left align-middle">Summa</th>
                  <th className="h-12 px-4 text-left align-middle">Päivämäärä</th>
                  <th className="h-12 px-4 text-left align-middle">Toiminnot</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(invoice => (
                  <tr key={invoice.invoiceId} className="border-b">
                    <td className="p-4">{invoice.invoiceId}</td>
                    <td className="p-4">{invoice.customerName}</td>
                    <td className="p-4">{renderInvoiceStatus(invoice.status)}</td>
                    <td className="p-4">
                      {invoice.total}
                      {' '}
                      EUR
                    </td>
                    <td className="p-4">{formatDate(invoice.createdAt)}</td>
                    <td className="p-4">
                      <Button
                        onClick={async () => {
                          const res = await axios.get(`/invoices/${invoice.id}/url`)
                          const { url } = res.data
                          window.open(url, '_blank') // open PDF in new tab
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Tarkastele
                      </Button>
                      <Button
                        variant="outline"
                        disabled={invoice.status === 'PAID'}
                        onClick={() => {
                          axios.post(`/invoices/${invoice.id}/mark-paid`)
                          setInvoices(invoices.map(i => i.id === invoice.id ? { ...i, status: 'PAID' } : i))
                          toast({
                            title: 'Lasku merkitty maksetuksi',
                            description: 'Lasku merkitty maksetuksi',
                            variant: 'success',
                          })
                        }}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Merkitse maksetuksi
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </SiikliPage>
  )
}
