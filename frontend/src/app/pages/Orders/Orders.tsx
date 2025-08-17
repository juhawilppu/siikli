import type { GetCustomerRequestDto, GetCustomersResponseDto, GetOrderList, OrderStatus } from '@/app/types/types'
import axios from 'axios'
import { endOfMonth, endOfWeek, startOfMonth, startOfWeek, subMonths } from 'date-fns'

import { fi } from 'date-fns/locale'
import {
  Calendar,
  Plus,
  Printer,
  Receipt,
  SearchIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { OrderStatusBadge } from '@/app/components/OrderStatusBadge'
import SiikliPage from '@/app/components/SiikliPage'
import { toast } from '@/app/hooks/use-toast'

import { dateToIso, formatDate, parseIsoDate } from '@/app/utils/date'
import { formatNumber } from '@/app/utils/money'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function Orders() {
  const now = new Date()
  const navigate = useNavigate()
  const [customers, setCustomers] = useState<GetCustomerRequestDto[]>()
  const [customerId, setCustomerId] = useState<string>()
  const [startDate, setStartDate] = useState<Date>(startOfMonth(now))
  const [endDate, setEndDate] = useState<Date>(endOfMonth(now))
  const [openStartDate, setOpenStartDate] = useState(false)
  const [viewMode, setViewMode] = useState<'free' | 'waybills' | 'invoices'>('free')
  const [status, setStatus] = useState<OrderStatus | 'ALL'>('ALL')
  const [openEndDate, setOpenEndDate] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)
  const [orders, setOrders] = useState<GetOrderList[]>([])

  useEffect(() => {
    axios.get<GetCustomersResponseDto>('/customers').then(res => setCustomers(res.data.customers))
  }, [])

  useEffect(() => {
    axios
      .get<GetOrderList[]>('/orders', {
        params: {
          startDate: dateToIso(startDate),
          endDate: dateToIso(endDate),
          customerId,
          status: status === 'ALL' ? undefined : status,
        },
      })
      .then(res => setOrders(res.data))
  }, [startDate, endDate, status, customerId])

  const handlePrintWaybills = async (preview = false) => {
    try {
      setIsPrinting(true)
      const response = await axios.get(
        `/orders/waybills`,
        {
          params: {
            startDate: dateToIso(startDate),
            endDate: dateToIso(endDate),
            customerId,
            preview,
          },
          responseType: 'blob',
        },
      )

      // Create blob URL
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)

      // Create temporary link and trigger download
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `kuormakirjat-${dateToIso(startDate)}-${dateToIso(endDate)}.pdf`)
      document.body.appendChild(link)
      link.click()

      // Cleanup
      link.remove()
      window.URL.revokeObjectURL(url)
      if (!preview) {
        setOrders(orders.map(order => ({ ...order, status: 'DELIVERED' })))
      }
    }
    catch (error) {
      console.error('Error downloading PDF:', error)
      // Could add error notification here
    }
    finally {
      setIsPrinting(false)
    }
  }

  const handlePrintInvoices = async (preview = false) => {
    if (!customerId || !customers) {
      toast({
        title: 'Valitse asiakas',
        description: 'Valitse asiakas, jolta haluat tulostaa laskut',
      })
      return
    }

    try {
      setIsPrinting(true)
      const response = await axios.get(
        `/invoices?startDate=${dateToIso(startDate)}&endDate=${dateToIso(endDate)}&preview=${preview}&customerId=${customerId}`,
        { responseType: 'blob' },
      )

      // Create blob URL
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)

      // Create temporary link and trigger download
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `laskut-${customers.find(c => c.id === customerId)?.name.toLowerCase().replace(' ', '-')}-${dateToIso(startDate)}-${dateToIso(endDate)}.pdf`)
      document.body.appendChild(link)
      link.click()

      // Cleanup
      link.remove()
      window.URL.revokeObjectURL(url)
      if (!preview) {
        setOrders(orders.map(order => ({ ...order, status: 'INVOICED' })))
      }
    }
    catch (error) {
      console.error('Error downloading PDF:', error)
      // Could add error notification here
    }
    finally {
      setIsPrinting(false)
    }
  }

  if (!customers) {
    return <div></div>
  }

  return (
    <>
      <SiikliPage
        title="Tilaukset"
        description="Selaa, luo ja hallitse tilauksia. Voit tulostaa rahtikirjoja ja laskuja sekä seurata tilausten tilaa."
        mainAction={(
          <Button onClick={() => navigate('/app/orders/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Uusi tilaus
          </Button>
        )}
      >
        <div className="mb-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
            <Button
              onClick={() => {
                setViewMode('free')
                setStartDate(startOfMonth(now))
                setEndDate(endOfMonth(now))
                setStatus('ALL')
              }}
              variant="ghost"
              size="sm"
              className={`gap-2 border-2 ${
                viewMode === 'free'
                  ? 'border-blue-600 text-blue-700 bg-blue-50 hover:bg-blue-100'
                  : 'border-transparent'
              }`}
            >
              <SearchIcon className="h-4 w-4" />
              Selaa tilauksia
            </Button>

            <Button
              onClick={() => {
                setViewMode('waybills')
                setStartDate(startOfWeek(now, { weekStartsOn: 1 }))
                setEndDate(endOfWeek(now, { weekStartsOn: 1 }))
                setStatus('WAITING_FOR_DELIVERY')
              }}
              variant="ghost"
              size="sm"
              className={`gap-2 border-2 ${
                viewMode === 'waybills'
                  ? 'border-blue-600 text-blue-700 bg-blue-50 hover:bg-blue-100'
                  : 'border-transparent'
              }`}
              disabled={isPrinting}
            >
              <Printer className="h-4 w-4" />
              Kuormakirjat
            </Button>

            <Button
              onClick={() => {
                setViewMode('invoices')
                setStartDate(startOfMonth(subMonths(now, 1)))
                setEndDate(endOfMonth(subMonths(now, 1)))
                setStatus('DELIVERED')
              }}
              variant="ghost"
              size="sm"
              className={`gap-2 border-2 ${
                viewMode === 'invoices'
                  ? 'border-blue-600 text-blue-700 bg-blue-50 hover:bg-blue-100'
                  : 'border-transparent'
              }`}
              disabled={isPrinting}
            >
              <Receipt className="h-4 w-4" />
              Laskut
            </Button>
          </div>
        </div>

        {viewMode && (
          <>
            <div className="space-y-5">
              <Card>
                <CardHeader>
                  <CardTitle>Hakuehdot</CardTitle>
                  <CardDescription className="text-gray-700">Suodata tilauksia päivämäärän mukaan</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4 w-full md:flex-row">
                    <div className="space-y-2 w-full md:w-1/4">
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
                          {customers?.map(customer => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 w-full md:w-1/4">
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
                            defaultMonth={startDate}
                            onSelect={(value) => {
                              setStartDate(value as Date)
                              setOpenStartDate(false)
                            }}
                            required
                            locale={fi}
                            toDate={endDate}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2 w-full md:w-1/4">
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
                            onSelect={(value) => {
                              setEndDate(value as Date)
                              setOpenEndDate(false)
                            }}
                            required
                            locale={fi}
                            fromDate={startDate}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2 w-full md:w-1/4">
                      <label className="text-sm font-medium">Toimituksen tila</label>
                      <Select
                        value={status}
                        onValueChange={(value) => {
                          setStatus(value as OrderStatus)
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Valitse tila" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">Kaikki</SelectItem>
                          <SelectItem value="WAITING_FOR_DELIVERY">Odottaa toimitusta</SelectItem>
                          <SelectItem value="DELIVERED">Toimitettu</SelectItem>
                          <SelectItem value="INVOICED">Laskutettu</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-col items-end justify-end gap-1">
                  {viewMode === 'waybills' && (
                    <div className="flex flex-col w-full gap-2 sm:gap-4 sm:flex-row-reverse sm:items-center">
                      <Button
                        variant="default"
                        onClick={() => handlePrintWaybills(false)}
                        disabled={isPrinting || status !== 'WAITING_FOR_DELIVERY' || orders.filter(order => order.status === 'WAITING_FOR_DELIVERY').length === 0}
                        className="w-full sm:w-auto"
                      >
                        {isPrinting
                          ? (
                              <>
                                <svg
                                  className="mr-2 h-4 w-4 animate-spin"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  >
                                  </circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  >
                                  </path>
                                </svg>
                                Tulosta kuormakirjat
                              </>
                            )
                          : (
                              <>
                                <Printer className="mr-2 h-4 w-4" />
                                Tulosta kuormakirjat
                              </>
                            )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handlePrintWaybills(true)}
                        disabled={isPrinting || status !== 'WAITING_FOR_DELIVERY' || orders.filter(order => order.status === 'WAITING_FOR_DELIVERY').length === 0}
                        className="w-full sm:w-auto"
                      >
                        {isPrinting
                          ? (
                              <>
                                <svg
                                  className="mr-2 h-4 w-4 animate-spin"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  >
                                  </circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  >
                                  </path>
                                </svg>
                                Esikatselu
                              </>
                            )
                          : (
                              <>
                                <Printer className="mr-2 h-4 w-4" />
                                Esikatselu
                              </>
                            )}
                      </Button>
                    </div>
                  )}
                  {viewMode === 'invoices' && (
                    <div className="flex flex-col w-full gap-2 sm:gap-4 sm:flex-row-reverse sm:items-center">
                      <Button
                        variant="default"
                        onClick={() => handlePrintInvoices(false)}
                        disabled={isPrinting || status !== 'DELIVERED' || orders.filter(order => order.status === 'DELIVERED').length === 0}
                        className="w-full sm:w-auto"
                      >
                        <Receipt className="mr-2 h-4 w-4" />
                        Tulosta lasku
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handlePrintInvoices(true)}
                        disabled={isPrinting || status !== 'DELIVERED' || orders.filter(order => order.status === 'DELIVERED').length === 0}
                        className="w-full sm:w-auto"
                      >
                        <Receipt className="mr-2 h-4 w-4" />
                        Esikatselu
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tilausnumero</TableHead>
                        <TableHead>Päivämäärä</TableHead>
                        <TableHead>Tila</TableHead>
                        <TableHead>Asiakas</TableHead>
                        <TableHead className="text-right">Summa sis. ALV 14 %</TableHead>
                        <TableHead className="text-right"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.length === 0
                        ? (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                Sinulla ei ole tilauksia tällä aikavälillä.
                                <br />
                                👉
                                {' '}
                                <NavLink to="/app/orders/new" className="text-blue-500">Luo uusi tilaus</NavLink>
                                .
                              </TableCell>
                            </TableRow>
                          )
                        : (
                            orders.map(order => (
                              <TableRow key={order.id}>
                                <TableCell className="font-medium">
                                  <Button
                                    variant="ghost"
                                    className="text-blue-500 font-bold"
                                    size="default"
                                    onClick={() => navigate(`/app/orders/${order.id}`)}
                                  >
                                    {order.orderNumber}
                                  </Button>
                                </TableCell>
                                <TableCell>{formatDate(parseIsoDate(order.deliveryDate))}</TableCell>
                                <TableCell><OrderStatusBadge status={order.status} /></TableCell>
                                <TableCell>
                                  {order.customer.name}
                                </TableCell>
                                <TableCell className="text-right">
                                  {formatNumber(order.total)}
                                  {' '}
                                  €
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    className="text-blue-500 font-bold"
                                    size="default"
                                    onClick={() => navigate(`/app/orders/${order.id}`)}
                                  >
                                    Avaa
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    <strong>{orders.length}</strong>
                    {' '}
                    {orders.length === 1 ? 'tilaus' : 'tilausta'}
                  </div>
                </CardFooter>
              </Card>
            </div>
          </>
        )}
      </SiikliPage>
    </>
  )
}
