import type { GetOrderList, OrderStatus } from '@/app/types/types'
import axios from 'axios'
import { endOfWeek, startOfWeek } from 'date-fns'

import { fi } from 'date-fns/locale'
import {
  Calendar,
  Package,
  Printer,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { OrderStatusBadge } from '@/app/components/OrderStatusBadge'
import SiikliPage from '@/app/components/SiikliPage'
import { dateToIso, formatDate, parseIsoDate } from '@/app/utils/date'

import { formatNumber } from '@/app/utils/money'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function Orders() {
  const now = new Date()
  const navigate = useNavigate()
  const [startDate, setStartDate] = useState<Date>(startOfWeek(now, { weekStartsOn: 1 }))
  const [openStartDate, setOpenStartDate] = useState(false)
  const [status, setStatus] = useState<OrderStatus | 'ALL'>('WAITING_FOR_DELIVERY')
  const [changeStatusOnPrint, setChangeStatusOnPrint] = useState(true)
  const [endDate, setEndDate] = useState<Date>(endOfWeek(now, { weekStartsOn: 1 }))
  const [openEndDate, setOpenEndDate] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)
  const [orders, setOrders] = useState<GetOrderList[]>([])

  useEffect(() => {
    axios
      .get<GetOrderList[]>('/orders', {
        params: {
          startDate: dateToIso(startDate),
          endDate: dateToIso(endDate),
          status: status === 'ALL' ? undefined : status,
        },
      })
      .then(res => setOrders(res.data))
  }, [startDate, endDate, status])

  const handlePrintWaybills = async () => {
    try {
      setIsPrinting(true)
      const response = await axios.get(
        `/orders/waybills?startDate=${dateToIso(startDate)}&endDate=${dateToIso(endDate)}&changeStatus=${changeStatusOnPrint}`,
        { responseType: 'blob' },
      )

      // Create blob URL
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)

      // Create temporary link and trigger download
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `waybills-${dateToIso(startDate)}-${dateToIso(endDate)}.pdf`)
      document.body.appendChild(link)
      link.click()

      // Cleanup
      link.remove()
      window.URL.revokeObjectURL(url)
    }
    catch (error) {
      console.error('Error downloading PDF:', error)
      // Could add error notification here
    }
    finally {
      setIsPrinting(false)
    }
  }

  return (
    <>
      <SiikliPage
        title="Tilaukset"
        description="Hallitse tilauksia tällä sivulla"
        mainAction={(
          <Button onClick={() => navigate('/app/orders/new')}>
            <Package className="mr-2 h-4 w-4" />
            Uusi tilaus
          </Button>
        )}
      >

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Hakuehdot</CardTitle>
              <CardDescription className="text-gray-700">Suodata tilauksia päivämäärän mukaan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
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
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tila</label>
                  <Select value={status} onValueChange={value => setStatus(value as OrderStatus)}>
                    <SelectTrigger>
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

          {/* Orders Table */}
          <Card>
            <CardHeader className="flex flex-col items-end justify-end gap-1">
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2 text-muted-foreground p-2 rounded-md">
                  <Checkbox
                    id="changeStatus"
                    checked={changeStatusOnPrint}
                    onCheckedChange={value => setChangeStatusOnPrint(value === 'indeterminate' ? true : value)}
                    disabled={isPrinting || status !== 'WAITING_FOR_DELIVERY'}
                  />
                  <label
                    htmlFor="changeStatus"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Merkitse tilaus toimitetuksi tulostaessa
                  </label>
                </div>
                <Button variant="outline" onClick={handlePrintWaybills} disabled={isPrinting || status !== 'WAITING_FOR_DELIVERY'}>
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
              </div>
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
                                {order.waybillNumber}
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
      </SiikliPage>
    </>
  )
}
