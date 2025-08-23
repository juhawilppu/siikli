import type { GetCustomerRequestDto, GetCustomersResponseDto, GetOrderListDto, OrderStatus } from '@siikli/shared'
import { dateToIso, formatDate, formatNumber, parseIsoDate } from '@siikli/shared'
import axios from 'axios'

import { fi } from 'date-fns/locale'
import {
  Calendar,
  Plus,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { OrderStatusBadge } from '@/app/components/OrderStatusBadge'
import SiikliPage from '@/app/components/SiikliPage'

import { Button } from '@/components/ui/button'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export interface Filters {
  startDate: Date
  endDate: Date
  customer: { id: string, name: string } | undefined
  status: OrderStatus | undefined
}

export default function OrderListBase({ title, description, defaultStartDate, defaultEndDate, actionComponent, status: defaultStatus, emptyStateComponent }: { title: string, description: string, defaultStartDate: Date, defaultEndDate: Date, actionComponent?: (filters: Filters, orderCount: number, refresh: () => void) => React.ReactNode, status?: OrderStatus, emptyStateComponent?: React.ReactNode }) {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState<GetCustomerRequestDto[]>()
  const [customerId, setCustomerId] = useState<string>()
  const [startDate, setStartDate] = useState<Date>(defaultStartDate)
  const [endDate, setEndDate] = useState<Date>(defaultEndDate)
  const [openStartDate, setOpenStartDate] = useState(false)
  const [status, setStatus] = useState<OrderStatus | 'ALL'>(defaultStatus ?? 'ALL')
  const [openEndDate, setOpenEndDate] = useState(false)
  const [orders, setOrders] = useState<GetOrderListDto[]>([])

  useEffect(() => {
    axios.get<GetCustomersResponseDto>('/customers').then(res => setCustomers(res.data.customers))
  }, [])

  const refresh = () => {
    axios
      .get<GetOrderListDto[]>('/orders', {
        params: {
          startDate: dateToIso(startDate),
          endDate: dateToIso(endDate),
          customerId,
          status: status === 'ALL' ? undefined : status,
        },
      })
      .then(res => setOrders(res.data))
  }

  useEffect(() => {
    refresh()
  }, [startDate, endDate, status, customerId])

  if (!customers) {
    return <div></div>
  }

  return (
    <>
      <SiikliPage
        title={title}
        description={description}
        mainAction={(
          <Button onClick={() => navigate('/app/orders/new')}>
            <Plus className="mr-2 h-4 w-4" />
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
              <div className="flex flex-col gap-4 w-full md:flex-row">
                <div className="space-y-2 w-full md:w-1/4">
                  <Label htmlFor="customer">Asiakas</Label>
                  <Select
                    value={customerId !== undefined ? customerId : 'none'}
                    onValueChange={(value) => {
                      setCustomerId(value === 'none' ? undefined : value)
                    }}
                  >
                    <SelectTrigger id="customer" className="w-full truncate">
                      <SelectValue placeholder="Valitse asiakas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        <span className="text-gray-500">Valitse asiakas</span>
                      </SelectItem>
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
                    disabled={defaultStatus !== undefined}
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

          {orders.length === 0
            ? (
                <div className="flex justify-center py-12">
                  <Card className="max-w-lg w-full shadow-lg border border-dashed border-gray-300 bg-muted/50">
                    <CardHeader>
                      <CardTitle className="text-lg text-center text-muted-foreground">Ei tietoja näytettäväksi</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center gap-4">
                        {/* Icon or illustration could go here if desired */}
                        <div className="text-center text-muted-foreground">
                          {emptyStateComponent}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )
            : (
                <Card>
                  <CardHeader className="flex flex-col items-end justify-end gap-1">
                    {actionComponent && actionComponent({ startDate, endDate, customer: customerId ? { id: customerId, name: customers?.find(c => c.id === customerId)?.name ?? '' } : undefined, status: status === 'ALL' ? undefined : status }, orders.length, refresh)}
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tilausnumero</TableHead>
                          <TableHead>Päivämäärä</TableHead>
                          <TableHead>Tila</TableHead>
                          <TableHead>Asiakas</TableHead>
                          <TableHead className="text-right">Summa ALV 0 %</TableHead>
                          <TableHead className="text-right"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map(order => (
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
                        ))}
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
              )}
        </div>
      </SiikliPage>
    </>
  )
}
