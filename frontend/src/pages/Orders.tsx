import type { GetOrderList } from '@/types/types'
import axios from 'axios'
import { endOfWeek, startOfWeek } from 'date-fns'

import { fi } from 'date-fns/locale'
import {
  Calendar,
  Package,
  Printer,
} from 'lucide-react'
import printJS from 'print-js'
import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import SiikliPage from '@/SiikliPage'
import { dateToString, formatDate } from '@/utils/date'
import { formatMoneyFi } from '@/utils/money'

export default function Orders() {
  const now = new Date()

  const [startDate, setStartDate] = useState<Date>(startOfWeek(now, { weekStartsOn: 1 }))
  const [endDate, setEndDate] = useState<Date>(endOfWeek(now, { weekStartsOn: 1 }))
  const [isLoading, setIsLoading] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)
  const [orders, setOrders] = useState<GetOrderList[]>([])
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])

  useEffect(() => {
    setIsLoading(true)
    axios
      .get<GetOrderList[]>('/orders', {
        params: {
          startDate: dateToString(startDate),
          endDate: dateToString(endDate),
        },
      })
      .then(res => setOrders(res.data))
      .finally(() => setIsLoading(false))
  }, [startDate, endDate])

  const handlePrintWaybills = () => {
    setIsPrinting(true)
    printJS({
      printable: `/api/orders/cargo_reports?startDate=${dateToString(startDate)}&endDate=${dateToString(endDate)}`,
      type: 'pdf',
      showModal: false,
      onLoadingEnd: () => setIsPrinting(false),
    })
  }

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev => (prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]))
  }

  const isAllSelected = orders.length > 0 && selectedOrders.length === orders.length

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedOrders([])
    }
    else {
      setSelectedOrders(orders.map(order => order.id))
    }
  }

  if (isLoading)
    return <SiikliPage title="Tilaukset" description="Hallitse tilauksia tällä sivulla" />

  return (
    <>
      <SiikliPage
        title="Tilaukset"
        description="Hallitse tilauksia tällä sivulla"
        mainAction={(
          <Button onClick={() => (window.location.href = '/orders/new')}>
            <Package className="mr-2 h-4 w-4" />
            Uusi tilaus
          </Button>
        )}
      >

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Hakuehdot</CardTitle>
            <CardDescription>Suodata tilauksia päivämäärän mukaan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
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
                      onSelect={value => setStartDate(value as Date)}
                      required
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
                    <CalendarComponent mode="single" selected={endDate} onSelect={value => setEndDate(value as Date)} required locale={fi} />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <div className="space-y-5">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={handlePrintWaybills} disabled={isPrinting}>
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
                    <TableHead className="w-[40px]">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        checked={isAllSelected}
                        onChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Päivämäärä</TableHead>
                    <TableHead>Asiakas</TableHead>
                    <TableHead>Summa</TableHead>
                    <TableHead className="text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Sinulla ei ole tilauksia tällä aikavälillä. 👉
                        {' '}
                        <NavLink to="/orders/new" className="text-blue-500">Luo uusi tilaus</NavLink>
                        .
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map(order => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            checked={selectedOrders.includes(order.id)}
                            onChange={() => toggleOrderSelection(order.id)}
                          />
                        </TableCell>
                        {/* <TableCell className="font-medium">{order.id}</TableCell> */}
                        <TableCell>{order.deliveryDate}</TableCell>
                        <TableCell>
                          {order.customer.chain}
                          {' '}
                          {order.customer.name}
                        </TableCell>
                        <TableCell>{formatMoneyFi(order.total)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            className="text-blue-500"
                            size="sm"
                            onClick={() => (window.location.href = `/orders/${order.id}`)}
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
