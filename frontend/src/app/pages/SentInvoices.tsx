import type { GetCustomerResponse, GetCustomersResponse, GetInvoicesResponse } from '@siikli/shared'
import { dateToIso, formatDate, GetInvoicesQuery, parseIsoDate } from '@siikli/shared'
import axios from 'axios'

import { enUS, fi } from 'date-fns/locale'
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
import { useApp } from '@/context/AppContext'
import { useTranslation } from '@/lib/translations'
import { cn, downloadUrl } from '@/lib/utils'
import { typeParse } from '@/lib/validate'
import { useIsMobile } from '../hooks/use-mobile'
import { toast } from '../hooks/use-toast'

export interface FlatOrderItem {
  deliveryDate: Date
  orderId: string
  orderNumber: number
  productName: string
}

function renderInvoiceStatus(status: 'PENDING' | 'PAID', t: (key: string) => string) {
  return <Badge className={cn(status === 'PAID' ? 'bg-green-500' : 'bg-gray-500')}>{status === 'PAID' ? t('invoiceStatus.PAID') : t('invoiceStatus.PENDING')}</Badge>
}

export function SentInvoices() {
  const { language } = useApp()
  const t = useTranslation()
  const isMobile = useIsMobile()

  const [customers, setCustomers] = useState<GetCustomerResponse[]>()
  const [invoices, setInvoices] = useState<GetInvoicesResponse[]>([])
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
    Promise.all([
      axios.get<GetCustomersResponse>('/customers'),
      axios.get<GetInvoicesResponse[]>('/invoices/list', {
        params: typeParse(
          GetInvoicesQuery,
          {
            customerId,
            startDate: dateToIso(startDate),
            endDate: dateToIso(endDate),
          },
        ),
      }),
    ])
      .then(([customersResponse, invoicesResponse]) => {
        setCustomers(customersResponse.data.customers)
        setInvoices(invoicesResponse.data)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading)
    return <SiikliPage title={t('sentInvoices.title')} description={t('sentInvoices.description')} />

  if (!customers)
    return <div>{t('sentInvoices.error.noCustomers')}</div>

  return (
    <SiikliPage title={t('sentInvoices.title')} description={t('sentInvoices.description')}>
      <Card>
        <CardHeader>
          <CardTitle>{t('sentInvoices.filters.title')}</CardTitle>
          <CardDescription className="text-gray-700">{t('sentInvoices.filters.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 w-full md:flex-row">
            <div className="space-y-2 flex-1">
              <Label htmlFor="customer">{t('sentInvoices.filters.customer.title') }</Label>
              <Select
                value={customerId}
                onValueChange={(value) => {
                  setCustomerId(value)
                }}
              >
                <SelectTrigger id="customer" className="w-full truncate">
                  <SelectValue placeholder={t('sentInvoices.filters.customer.select')} />
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
              <label className="text-sm font-medium">{t('sentInvoices.filters.startDate.title')}</label>
              <Popover open={openStartDate} onOpenChange={setOpenStartDate}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {startDate ? formatDate(startDate) : <span>{t('sentInvoices.filters.startDate.select')}</span>}
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
                    locale={language === 'fi' ? fi : enUS}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2 flex-1">
              <label className="text-sm font-medium">{t('sentInvoices.filters.endDate.title')}</label>
              <Popover open={openEndDate} onOpenChange={setOpenEndDate}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {endDate ? formatDate(endDate) : <span>{t('sentInvoices.filters.endDate.select')}</span>}
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
                    locale={language === 'fi' ? fi : enUS}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t('sentInvoices.table.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead>
                <tr className="border-b">
                  <th className="h-12 px-4 text-left align-middle">{t('sentInvoices.table.invoiceNumber')}</th>
                  <th className="h-12 px-4 text-left align-middle">{t('sentInvoices.table.customer')}</th>
                  <th className="h-12 px-4 text-left align-middle">{t('sentInvoices.table.status')}</th>
                  <th className="h-12 px-4 text-left align-middle">{t('sentInvoices.table.total')}</th>
                  <th className="h-12 px-4 text-left align-middle">{t('sentInvoices.table.date')}</th>
                  <th className="h-12 px-4 text-left align-middle">{t('sentInvoices.table.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-4 text-center">
                      {t('sentInvoices.table.noInvoices')}
                    </td>
                  </tr>
                )}
                {invoices.map(invoice => (
                  <tr key={invoice.invoiceId} className="border-b">
                    <td className="p-4">{invoice.invoiceId}</td>
                    <td className="p-4">{invoice.customerName}</td>
                    <td className="p-4">{renderInvoiceStatus(invoice.status, t as any)}</td>
                    <td className="p-4">
                      {invoice.total}
                      {' '}
                      EUR
                    </td>
                    <td className="p-4">{formatDate(parseIsoDate(invoice.createdAt))}</td>
                    <td className="p-4 flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={async () => {
                          const res = await axios.get(`/invoices/${invoice.id}/url`)
                          const { url } = res.data
                          downloadUrl(url, isMobile)
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        disabled={invoice.status === 'PAID'}
                        onClick={() => {
                          axios.post(`/invoices/${invoice.id}/mark-paid`)
                          setInvoices(invoices.map(i => i.id === invoice.id ? { ...i, status: 'PAID' } : i))
                          toast({
                            title: t('sentInvoices.table.markPaid.toast.title'),
                            description: t('sentInvoices.table.markPaid.toast.description'),
                            variant: 'success',
                          })
                        }}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        {t('sentInvoices.table.markPaid.button')}
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
