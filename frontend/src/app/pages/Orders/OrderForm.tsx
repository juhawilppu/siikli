import type { GetCustomerRequestDto, GetCustomersResponseDto, GetOrderDto, GetPackageSettings, GetProductResponseDto, OrderRow, PostOrderRequestDto, PostOrderResponseDto } from '@siikli/shared'

import type React from 'react'

import { captureException } from '@sentry/react'
import { dateToIso, formatNumber, OrderStatus, parseDecimal, parseToNumber } from '@siikli/shared'
import axios from 'axios'
import { format } from 'date-fns'
import { fi } from 'date-fns/locale'
import { Decimal } from 'decimal.js'
import {
  Calendar,
  Check,
  ChevronsUpDown,
  Mail,
  Phone,
  Plus,
  Printer,
  Save,
  Trash2,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink, useNavigate, useParams } from 'react-router-dom'
import { OrderStatusBadge } from '@/app/components/OrderStatusBadge'
import SiikliPage from '@/app/components/SiikliPage'
import { useIsMobile } from '@/app/hooks/use-mobile'
import { useToast } from '@/app/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { cn, downloadUrl } from '@/lib/utils'
import { serializeNumber } from '@/utils/serialization'
import ConfirmDialog from '../../components/ConfirmDialog'

export default function CreateOrder() {
  const [customers, setCustomers] = useState<GetCustomerRequestDto[]>()
  const [products, setProducts] = useState<GetProductResponseDto[]>()
  const [isLoading, setIsLoading] = useState(true)
  // const [openOrderStatus, setOpenOrderStatus] = useState(false)
  const [status, setStatus] = useState<OrderStatus>(OrderStatus.WAITING_FOR_DELIVERY)
  const [invoiceId, setInvoiceId] = useState<string | null>(null)
  const [deliveryDate, setDeliveryDate] = useState<Date>()
  const [customerId, setCustomerId] = useState<string>('')
  const [hasWaybillNote, setHasWaybillNote] = useState<boolean>(false)
  const [waybillNote, setWaybillNote] = useState({ title: '', content: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [open, setOpen] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState(false)
  const [inputValuePackageType, setInputValuePackageType] = useState('')
  const [inputValuePackageSize, setInputValuePackageSize] = useState('')
  const [packageTypes, setPackageTypes] = useState<string[]>()
  const [packageSizes, setPackageSizes] = useState<number[]>()
  const [openPackageType, setOpenPackageType] = useState<string>()
  const [openPackageSize, setOpenPackageSize] = useState<string>()
  const [orderItems, setOrderItems] = useState<{
    id: string
    deleted?: boolean
    productId: string
    price: string // Use string to render with 2 decimal places and allow empty string
    price0: string // Use string to render with 2 decimal places and allow empty string
    amount: string // Use string to render with 2 decimal places
    packages: number
    packageSize?: number
    packageType: string
    freetext: string
    unsaved?: boolean
    createdAt: Date
  }[]>([
    {
      id: Date.now().toString(),
      deleted: false,
      unsaved: true,
      productId: '',
      amount: '',
      packages: 0,
      packageSize: undefined,
      packageType: '',
      price: '',
      price0: '',
      freetext: '',
      createdAt: new Date(),
    },
  ])

  const [orderLimit, setOrderLimit] = useState<number | null>(null)
  const { orderId } = useParams()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const { toast } = useToast()

  const handleAddItem = () => {
    setOrderItems([
      ...orderItems,
      {
        id: Date.now().toString(),
        unsaved: true,
        productId: '',
        amount: '',
        packages: 0,
        packageSize: 0,
        packageType: '',
        price: '',
        price0: '',
        freetext: '',
        createdAt: new Date(),
      },
    ])
  }

  useEffect(() => {
    const loadData = async () => {
      const promises = await Promise.all([
        axios.get<GetCustomersResponseDto>('/customers'),
        axios.get<GetProductResponseDto[]>('/products'),
        axios.get<GetPackageSettings>('/tenants/package-settings'),
        axios.get<{ remaining: number }>(`/orders/limit`),
      ])

      setCustomers(promises[0].data.customers)
      setProducts(promises[1].data)
      setPackageTypes(promises[2].data.packageTypes)
      setPackageSizes(promises[2].data.packageSizes)
      setOrderLimit(promises[3].data.remaining)
      if (orderId) {
        const res = await axios.get<GetOrderDto>(`/orders/${orderId}`)
        setOrderItems(res.data.items.map(item => ({
          ...item,
          price: formatNumber(item.price),
          price0: formatNumber(item.price0),
          amount: formatNumber(item.amount),
          createdAt: new Date(item.createdAt),
        })))
        setCustomerId(res.data.customerId)
        setInvoiceId(res.data.invoiceId)
        console.log(`settins customerId to ${res.data.customerId}`)
        setDeliveryDate(new Date(res.data.deliveryDate))
        setStatus(res.data.status)
        setHasWaybillNote(res.data.hasNote)
        if (res.data.hasNote) {
          setWaybillNote({ title: res.data.noteHeader || '', content: res.data.noteBody || '' })
        }
      }
      setIsLoading(false)
    }
    loadData()
  }, [orderId])

  const handleRemoveItem = (id: string) => {
    setOrderItems(orderItems.map((item) => {
      if (item.id === id) {
        item.deleted = true
      }
      return item
    }))
  }

  const handleItemChange = (id: string, field: keyof OrderRow, value: any) => {
    if (!products) {
      return
    }
    setOrderItems(
      orderItems.map((item) => {
        if (item.id === id) {
          console.log('item', item)
          console.log('field', field)
          console.log('value', value)
          const updatedItem = { ...item, [field]: value }

          // If product changed, update price and package details
          if (field === 'productId') {
            const product = products.find(p => p.id === value)
            if (product) {
              updatedItem.price = product.price ? formatNumber(product.price) : ''
              updatedItem.price0 = product.price0 ? formatNumber(product.price0) : ''
              updatedItem.packageSize = product.packageSize || undefined
              updatedItem.packageType = product.packageType || ''
            }
          }

          if (field === 'price') {
            updatedItem.price0 = formatNumber(parseDecimal(value || '0').mul(1 / 1.14))
          }
          if (field === 'price0') {
            updatedItem.price = formatNumber(parseDecimal(value || '0').mul(1.14))
          }

          // Recalculate packages if amount or package size changed
          if (field === 'amount' || field === 'packageSize') {
            if (updatedItem.packageSize && updatedItem.amount) {
              updatedItem.packages = Number.parseFloat(updatedItem.amount) / updatedItem.packageSize
            }
          }

          return updatedItem
        }
        return item
      }),
    )
  }

  const selectedCustomer = customers?.find(c => c.id === customerId)

  const calculateTotal = () => {
    const total = orderItems.filter(item => !item.deleted).reduce((sum, item) => sum.plus((parseDecimal(item.amount || '0')).mul(parseDecimal(item.price || '0'))), new Decimal(0))
    return total.toDecimalPlaces(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSubmitting(true)

      if (!customers) {
        return
      }
      if (!selectedCustomer) {
        toast({
          title: 'Valitse asiakas',
          description: 'Asiakas ei voi olla tyhjä',
          variant: 'destructive',
        })
        setIsSubmitting(false)
        return
      }
      if (!deliveryDate) {
        toast({
          title: 'Toimituspäivä ei voi olla tyhjä',
          description: 'Valitse toimituspäivä',
          variant: 'destructive',
        })
        setIsSubmitting(false)
        return
      }
      if (hasWaybillNote && (!waybillNote.title || !waybillNote.content)) {
        toast({
          title: 'Huomautus ei voi olla tyhjä',
          description: 'Poista huomautus tai täytä kumpikin kenttä',
          variant: 'destructive',
        })
        setIsSubmitting(false)
        return
      }
      const customer = customers.find(c => c.id === customerId)
      if (!customer) {
        return
      }

      const productIds = new Set()
      for (const item of orderItems.filter(item => !item.deleted)) {
        if (productIds.has(item.productId)) {
          toast({
            title: 'Sama tuote useamman kerran',
            description: `Tuote ${products?.find(p => p.id === item.productId)?.name} on jo lisätty tilaukseen`,
            variant: 'destructive',
          })
          setIsSubmitting(false)
          return
        }
        productIds.add(item.productId)
      }

      for (const item of orderItems.filter(item => !item.deleted)) {
        if (!item.productId) {
          toast({
            title: 'Tuote ei voi olla tyhjä',
            description: 'Valitse tuote tai poista rivi',
            variant: 'destructive',
          })
          setIsSubmitting(false)
          return
        }
        if (item.amount === '0,00' || item.amount === '') {
          toast({
            title: 'Määrä ei voi olla tyhjä',
            description: `Valitse määrä tuotteelle ${products?.find(p => p.id === item.productId)?.name} tai poista rivi`,
            variant: 'destructive',
          })
          setIsSubmitting(false)
          return
        }
        if (!item.price) {
          toast({
            title: 'Hinta ei voi olla tyhjä',
            description: 'Valitse hinta tai poista rivi',
            variant: 'destructive',
          })
          setIsSubmitting(false)
          return
        }
        if (!item.price0) {
          toast({
            title: 'Hinta ei voi olla tyhjä',
            description: 'Valitse hinta tai poista rivi',
            variant: 'destructive',
          })
          setIsSubmitting(false)
          return
        }
        if (!item.packageSize) {
          toast({
            title: 'Pakkauskoko ei voi olla tyhjä',
            description: 'Valitse pakkauskoko tai poista rivi',
            variant: 'destructive',
          })
          setIsSubmitting(false)
          return
        }
        if (!item.packageType) {
          toast({
            title: 'Pakkaustyyppi ei voi olla tyhjä',
            description: 'Valitse pakkaustyyppi tai poista rivi',
            variant: 'destructive',
          })
          setIsSubmitting(false)
          return
        }
      }

      const data: PostOrderRequestDto = {
        customerId: selectedCustomer.id,
        deliveryDate: dateToIso(deliveryDate),
        hasNote: hasWaybillNote,
        status,
        noteBody: hasWaybillNote ? waybillNote.content : null,
        noteHeader: hasWaybillNote ? waybillNote.title : null,
        items: orderItems.filter(item => !(item.unsaved && item.deleted)).map(item => ({
          ...item,
          id: item.unsaved ? undefined : item.id,
          price: serializeNumber(item.price),
          price0: serializeNumber(item.price0),
          amount: serializeNumber(item.amount),
          packageSize: item.packageSize || 0,
          packageType: item.packageType || '',
        })),
      }
      console.log('Saving order:', data)

      if (orderId) {
        // Update order
        await axios.post(`/orders/${orderId}`, data)
        const res = await axios.get<GetOrderDto>(`/orders/${orderId}`)
        setOrderItems(res.data.items.map(item => ({
          ...item,
          price: formatNumber(item.price),
          price0: formatNumber(item.price0),
          amount: formatNumber(item.amount),
          createdAt: new Date(item.createdAt),
        })))
        toast({
          title: 'Tilaus tallennettu',
          description: `Tilaus asiakkaalle ${customer.name} tallennettiin onnistuneesti.`,
          variant: 'success',
        })
      }
      else {
        // Create new order
        const res = await axios.post<PostOrderResponseDto>('/orders', data)
        toast({
          title: 'Tilaus luotu',
          description: `Tilaus asiakkaalle ${customer.name} luotiin onnistuneesti.`,
          variant: 'success',
        })
        navigate(`/app/orders/${res.data.id}`, { replace: false })
      }
    }
    catch (err) {
      console.error(err)
      captureException(err)
      toast({
        title: 'Tilauksen tallentaminen epäonnistui',
        description: `Ylläpitomme saa tästä automaattisen virheviestin ja korjaa asian mahdollisimman pian.`,
        variant: 'destructive',
      })
    }
    finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || !customers || !products || !packageTypes || !packageSizes) {
    return <SiikliPage title={orderId ? 'Tilaus' : 'Uusi tilaus'} description="Täytä tilauksen tiedot" />
  }

  if (customers.length === 0 || products.length === 0) {
    return (
      <SiikliPage
        title={orderId ? 'Tilaus' : 'Uusi tilaus'}
        description="Täytä tilauksen tiedot"
        mainAction={<></>}
      >
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-6 text-center">
          <div className="text-4xl">📦</div>
          <div className="space-y-3">
            {customers.length === 0 && (
              <div className="text-sm bg-muted rounded-md px-4 py-2">
                👤 Sinulla ei ole vielä asiakkaita.
                <br />
                👉
                <NavLink to="/app/customers" className="underline text-primary">
                  Lisää ensimmäinen asiakas
                </NavLink>
                .
              </div>
            )}
            {products.length === 0 && (
              <div className="text-sm bg-muted rounded-md px-4 py-2">
                🥔 Sinulla ei ole vielä tuotteita.
                <br />
                👉
                <NavLink to="/app/products" className="underline text-primary">
                  Lisää ensimmäinen tuote
                </NavLink>
                .
              </div>
            )}
          </div>
        </div>
      </SiikliPage>
    )
  }

  const handleConfirmDelete = async () => {
    try {
      setIsSubmitting(true)
      await axios.delete(`/orders/${orderId}`)
      toast({
        title: 'Tilaus poistettu',
        description: 'Tilaus poistettu onnistuneesti',
        variant: 'success',
      })
      navigate('/orders')
    }
    catch (err) {
      console.error(err)
      captureException(err)
      toast({
        title: 'Tilauksen poistaminen epäonnistui',
        description: 'Tilauksen poistaminen epäonnistui.',
        variant: 'destructive',
      })
    }
    finally {
      setIsSubmitting(false)
    }
  }

  if (!orderId && orderLimit !== null && orderLimit === 0) {
    return (
      <SiikliPage
        title="Tilaus"
        description="Täytä tilauksen tiedot"
      >

        <div className="text-sm bg-red-100 rounded-md px-4 py-2 mb-4">
          Olet luonut maksimimäärän tilauksia tämän kuukauden aikana. Haluatko luoda enemmän? Päivitä
          {' '}
          <NavLink to="/own-company" className="underline text-primary">
            Premium-tiliin
          </NavLink>
          .
        </div>
      </SiikliPage>
    )
  }

  return (
    <SiikliPage
      title={orderId ? 'Tilaus' : 'Uusi tilaus'}
      description="Täytä tilauksen tiedot"
      mainAction={
        <></>
      }
    >
      {orderId && (
        <Button
          variant="ghost"
          size="icon"
          disabled={isSubmitting || status !== 'WAITING_FOR_DELIVERY'}
          type="button"
          onClick={() => setConfirmDialog(true)}
          className="absolute z-10 top-32 right-9 h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
      {!orderId && orderLimit !== null && orderLimit < 5 && orderLimit > 0 && (
        <div className="text-sm bg-yellow-100 rounded-md px-4 py-2 mb-4">
          Voit luoda vielä
          {' '}
          {orderLimit}
          {' '}
          {orderLimit === 1 ? 'tilauksen' : 'tilausta'}
          {' '}
          tämän kuukauden aikana.
        </div>
      )}
      {confirmDialog && (
        <ConfirmDialog
          isSaving={isSubmitting}
          title="Poista tilaus"
          description="Tämä toiminto poistaa tilauksen lopullisesti. Haluatko varmasti poistaa tilauksen?"
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDialog(false)}
        />
      )}
      <form onSubmit={handleSubmit}>
        <div className="space-y-6 pb-20">
          {/* Customer and Delivery Information */}
          <Card>
            <CardHeader>
              <CardTitle>Tilauksen perustiedot</CardTitle>
              <CardDescription className="text-gray-700">Valitse asiakas ja toimituspäivä</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="customer">Asiakas</Label>
                  <div className="flex gap-2">
                    <Select value={customerId} disabled={status !== 'WAITING_FOR_DELIVERY'} onValueChange={setCustomerId}>
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
                  </div>
                  {selectedCustomer && (
                    <p className="text-xs text-gray-500 mt-1">
                      {[
                        selectedCustomer.streetAddress,
                        selectedCustomer.postalCode,
                      ].filter(Boolean).join(', ')}
                      {selectedCustomer.city && (
                        <>
                          <br />
                          {selectedCustomer.city}
                        </>
                      )}
                      {selectedCustomer.phone && (
                        <>
                          <br />
                          <Phone className="inline-block w-4 h-4 mr-1" />
                          {' '}
                          {selectedCustomer.phone}
                        </>
                      )}
                      {selectedCustomer.email && (
                        <>
                          <br />
                          <Mail className="inline-block w-4 h-4 mr-1" />
                          {' '}
                          {selectedCustomer.email}
                        </>
                      )}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delivery-date">Toimituspäivä</Label>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        disabled={status !== 'WAITING_FOR_DELIVERY'}
                        className={`w-full justify-start text-left font-normal ${deliveryDate ? '' : 'placeholder'}`}
                        id="delivery-date"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {deliveryDate
                          ? format(deliveryDate, 'd.M.yyyy', { locale: fi })
                          : <span>Valitse päivä</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={deliveryDate}
                        defaultMonth={deliveryDate}
                        onSelect={(date) => {
                          setDeliveryDate(date)
                          setOpen(false) // Close popover on date select
                        }}
                        initialFocus
                        locale={fi}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-1 w-full">
                  <Label htmlFor="order-status" className="text-xs leading-tight">Tilauksen tila</Label>
                  <div className="flex flex-col gap-2 w-full">
                    <div className="w-fit">
                      <OrderStatusBadge status={status} />
                    </div>
                    {status !== 'WAITING_FOR_DELIVERY' && (
                      <div className="flex flex-row items-center gap-1 text-xs text-gray-500 leading-tight w-full">
                        <Button
                          variant="ghost"
                          type="button"
                          className="h-6 px-1 py-0 min-w-0 ml-1"
                          style={{ fontSize: '0.85em', lineHeight: '1.1' }}
                          onClick={async () => {
                            try {
                              const res = await axios.get(`/orders/${orderId}/waybill`)
                              const { url } = res.data
                              downloadUrl(url, isMobile)
                            }
                            catch (err) {
                              console.error(err)
                              toast({
                                title: 'Kuormakirjan näyttäminen epäonnistui',
                                description: 'Kuormakirjan näyttäminen epäonnistui. Yritä myöhemmin uudelleen.',
                                variant: 'destructive',
                              })
                            }
                          }}
                        >
                          <Printer className="w-4 h-4" />
                          <span className="ml-0.5 xs:inline">Kuormakirja</span>
                        </Button>
                      </div>
                    )}
                    {status === 'INVOICED' && (
                      <div className="flex flex-row items-center gap-1 text-xs text-gray-500 leading-tight">
                        <Button
                          variant="ghost"
                          type="button"
                          className="h-6 px-1 py-0 min-w-0 ml-1"
                          style={{ fontSize: '0.85em', lineHeight: '1.1' }}
                          onClick={async () => {
                            try {
                              const res = await axios.get(`/invoices/${invoiceId}/url`)
                              const { url } = res.data
                              downloadUrl(url, isMobile)
                            }
                            catch (err) {
                              console.error(err)
                              toast({
                                title: 'Laskun näyttäminen epäonnistui',
                                description: 'Laskun näyttäminen epäonnistui. Yritä myöhemmin uudelleen.',
                                variant: 'destructive',
                              })
                            }
                          }}
                        >
                          <Printer className="w-4 h-4" />
                          <span className="ml-0.5 xs:inline">Lasku</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Separator className="my-4" />
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-waybill"
                  checked={hasWaybillNote}
                  disabled={status !== 'WAITING_FOR_DELIVERY'}
                  onCheckedChange={checked => setHasWaybillNote(checked as boolean)}
                />
                <Label htmlFor="include-waybill" className="font-medium">
                  Lisää huomautus kuormakirjaan
                </Label>
              </div>
              {hasWaybillNote && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="note-title">Otsikko</Label>
                    <Input
                      id="note-title"
                      value={waybillNote.title}
                      onChange={e => setWaybillNote({ ...waybillNote, title: e.target.value })}
                      placeholder="Otsikko"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="note-content">Sisältö</Label>
                    <Textarea
                      id="note-content"
                      value={waybillNote.content}
                      onChange={e => setWaybillNote({ ...waybillNote, content: e.target.value })}
                      placeholder="Sisältö, esim. toimitusohjeita"
                      rows={3}
                    />
                  </div>
                </>
              )}

            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Tuotteet</CardTitle>
                <CardDescription className="text-gray-700">Täytä tilauksen tuotteet</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea>
                <div className="space-y-4">
                  {orderItems.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()).filter(item => !item.deleted).map(item => (
                    <div key={item.id} className="rounded-lg border p-4 relative">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={status !== 'WAITING_FOR_DELIVERY'}
                        className="absolute right-2 top-2"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Poista</span>
                      </Button>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor={`product-${item.productId}`}>Tuote</Label>
                          <Select
                            value={item.productId}
                            disabled={status !== 'WAITING_FOR_DELIVERY'}
                            onValueChange={value => handleItemChange(item.id, 'productId', value)}
                          >
                            <SelectTrigger id={`product-${item.id}`}>
                              <SelectValue placeholder="Valitse tuote" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map(product => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`amount-${item.id}`}>
                            Määrä (kg)
                          </Label>
                          <Input
                            id={`amount-${item.id}`}
                            value={isMobile ? parseToNumber(item.amount) : item.amount}
                            inputMode="decimal"
                            type={isMobile ? 'number' : 'text'}
                            min={isMobile ? 0 : undefined}
                            step={isMobile ? 0.01 : undefined}
                            disabled={status !== 'WAITING_FOR_DELIVERY'}
                            onChange={e =>
                              handleItemChange(item.id, 'amount', e.target.value)}
                            onBlur={() => {
                              console.log('onBlur', item.amount)
                              handleItemChange(item.id, 'amount', formatNumber(item.amount || '0'))
                            }}
                          />
                        </div>

                        {!selectedCustomer?.showPriceWithoutTax && (
                          <div className="space-y-2">
                            <Label htmlFor={`price-${item.id}`}>
                              Hinta (€/kg)
                              {' '}
                              ALV 14 %
                            </Label>
                            <Input
                              id={`price-${item.id}`}
                              value={isMobile ? parseToNumber(item.price) : item.price}
                              inputMode="decimal"
                              type={isMobile ? 'number' : 'text'}
                              min={isMobile ? 0 : undefined}
                              step={isMobile ? 0.01 : undefined}
                              disabled={status !== 'WAITING_FOR_DELIVERY'}
                              onChange={e =>
                                handleItemChange(item.id, 'price', e.target.value)}
                              onBlur={(e) => {
                                console.log('onBlur', e.target.value)
                                handleItemChange(item.id, 'price', formatNumber(e.target.value || '0'))
                              }}
                            />
                          </div>
                        )}

                        {selectedCustomer?.showPriceWithoutTax && (
                          <div className="space-y-2">
                            <Label htmlFor={`price-${item.id}`}>
                              Hinta (€/kg)
                              {' '}
                              ALV 0 %
                            </Label>
                            <Input
                              id={`price-${item.id}`}
                              value={isMobile ? parseToNumber(item.price0) : item.price0}
                              inputMode="decimal"
                              type={isMobile ? 'number' : 'text'}
                              min={isMobile ? 0 : undefined}
                              step={isMobile ? 0.01 : undefined}
                              disabled={status !== 'WAITING_FOR_DELIVERY'}
                              onChange={e =>
                                handleItemChange(item.id, 'price0', e.target.value)}
                              onBlur={(e) => {
                                console.log('onBlur', e.target.value)
                                handleItemChange(item.id, 'price0', formatNumber(e.target.value || '0'))
                              }}
                            />
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label htmlFor={`package-size-${item.id}`}>Pakkauskoko</Label>
                          <Popover open={openPackageSize === item.id} onOpenChange={open => setOpenPackageSize(open ? item.id : undefined)}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={`w-full justify-between ${item.packageSize ? '' : 'placeholder'}`}
                                disabled={status !== 'WAITING_FOR_DELIVERY'}
                              >
                                {item.packageSize || 'Valitse pakkauskoko'}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandInput
                                  placeholder="Syötä pakkauskoko..."
                                  onValueChange={value => setInputValuePackageSize(value)}
                                />
                                <CommandEmpty>
                                  {inputValuePackageSize.length > 0 && (
                                    <button
                                      onClick={() => {
                                        const size = Number(inputValuePackageSize.trim())
                                        if (size && !Number.isNaN(size)) {
                                          handleItemChange(item.id, 'packageSize', size)
                                          setPackageSizes([...packageSizes, size])
                                          setOpenPackageSize(undefined)
                                          setInputValuePackageSize('')
                                        }
                                        else {
                                          toast({
                                            title: 'Virhe',
                                            description: 'Syötä pakkauskoko numerona.',
                                            variant: 'destructive',
                                          })
                                        }
                                      }}
                                      className="flex items-center space-x-2 text-sm p-2 hover:bg-muted w-full text-left"
                                    >
                                      <Plus className="w-4 h-4" />
                                      <span>
                                        Luo:
                                        {' '}
                                        {inputValuePackageSize}
                                      </span>
                                    </button>
                                  )}
                                </CommandEmpty>
                                <CommandGroup>
                                  {packageSizes
                                    .filter(size => size.toString().includes(inputValuePackageSize))
                                    .sort((a, b) => a - b)
                                    .map(size => (
                                      <CommandItem
                                        key={size}
                                        onSelect={() => {
                                          handleItemChange(item.id, 'packageSize', size)
                                          setOpenPackageSize(undefined)
                                          setInputValuePackageSize('')
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            'mr-2 h-4 w-4',
                                            item.packageSize === size ? 'opacity-100' : 'opacity-0',
                                          )}
                                        />
                                        {size}
                                      </CommandItem>
                                    ))}
                                  {!packageSizes.includes(Number(inputValuePackageSize)) && inputValuePackageSize.length > 0 && (
                                    <div className="p-2 border-t">
                                      <button
                                        onClick={() => {
                                          const size = Number(inputValuePackageSize.trim())
                                          if (size && !Number.isNaN(size)) {
                                            handleItemChange(item.id, 'packageSize', size)
                                            setPackageSizes([...packageSizes, size])
                                            setOpenPackageSize(undefined)
                                            setInputValuePackageSize('')
                                          }
                                          else {
                                            toast({
                                              title: 'Virhe',
                                              description: 'Syötä pakkauskoko numerona.',
                                              variant: 'destructive',
                                            })
                                          }
                                        }}
                                        className="flex items-center space-x-2 text-sm p-2 hover:bg-muted w-full text-left"
                                      >
                                        <Plus className="w-4 h-4" />
                                        <span>
                                          Luo:
                                          {' '}
                                          {inputValuePackageSize}
                                        </span>
                                      </button>
                                    </div>
                                  )}
                                </CommandGroup>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`package-type-${item.id}`}>Pakkaustyyppi</Label>
                          <Popover open={openPackageType === item.id} onOpenChange={open => setOpenPackageType(open ? item.id : undefined)}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={`w-full justify-between ${item.packageType ? '' : 'placeholder'}`}
                                disabled={status !== 'WAITING_FOR_DELIVERY'}
                              >
                                {item.packageType || 'Valitse pakkaustyyppi'}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandInput
                                  placeholder="Syötä pakkaustyyppi..."
                                  maxLength={16}
                                  onValueChange={setInputValuePackageType}
                                />
                                <CommandEmpty>
                                  {inputValuePackageType.length > 0 && (
                                    <button
                                      onClick={() => {
                                        const type = inputValuePackageType.trim()
                                        if (type) {
                                          handleItemChange(item.id, 'packageType', type)
                                          setPackageTypes([...packageTypes, type])
                                          setOpenPackageType(undefined)
                                          setInputValuePackageType('')
                                        }
                                      }}
                                      className="flex items-center space-x-2 text-sm p-2 hover:bg-muted w-full text-left"
                                    >
                                      <Plus className="w-4 h-4" />
                                      <span>
                                        Luo:
                                        {' '}
                                        {inputValuePackageType}
                                      </span>
                                    </button>
                                  )}
                                </CommandEmpty>
                                <CommandGroup>
                                  {packageTypes
                                    .filter(type => inputValuePackageType.length === 0 || type.toLowerCase().includes(inputValuePackageType.toLowerCase()))
                                    .sort()
                                    .map(type => (
                                      <CommandItem
                                        key={type}
                                        onSelect={() => {
                                          handleItemChange(item.id, 'packageType', type)
                                          setOpenPackageType(undefined)
                                          setInputValuePackageType('')
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            'mr-2 h-4 w-4',
                                            item.packageType === type ? 'opacity-100' : 'opacity-0',
                                          )}
                                        />
                                        {type}
                                      </CommandItem>
                                    ))}
                                  {!packageTypes.includes(inputValuePackageType) && inputValuePackageType.length > 0 && (
                                    <div className="p-2 border-t">
                                      <button
                                        onClick={() => {
                                          const type = inputValuePackageType.trim()
                                          if (type) {
                                            handleItemChange(item.id, 'packageType', type)
                                            setPackageTypes([...packageTypes, type])
                                            setOpenPackageType(undefined)
                                            setInputValuePackageType('')
                                          }
                                        }}
                                        className="flex items-center space-x-2 text-sm p-2 hover:bg-muted w-full text-left"
                                      >
                                        <Plus className="w-4 h-4" />
                                        <span>
                                          Luo:
                                          {' '}
                                          {inputValuePackageType}
                                        </span>
                                      </button>
                                    </div>
                                  )}
                                </CommandGroup>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`packages-${item.id}`}>Laatikkoa</Label>
                          <Input
                            id={`packages-${item.id}`}
                            type="number"
                            disabled
                            min="0"
                            value={item.packages.toFixed(2)}
                            readOnly
                            className="bg-muted"
                          />
                        </div>

                        <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                          <Label htmlFor={`notes-${item.id}`}>Lisätieto</Label>
                          <Input
                            id={`notes-${item.id}`}
                            value={item.freetext}
                            disabled={status !== 'WAITING_FOR_DELIVERY'}
                            onChange={e => handleItemChange(item.id, 'freetext', e.target.value)}
                            placeholder="Lisätietoa tästä tuotteesta"
                          />
                        </div>
                      </div>

                      <div className="mt-4 text-right">
                        {!selectedCustomer?.showPriceWithoutTax && (
                          <p className="text-sm font-medium">
                            Tuote yhteensä (sis. ALV 14 %):
                            {' '}
                            {formatNumber(parseDecimal(item.amount || '0').mul(parseDecimal(item.price || '0')))}
                            {' '}
                            €
                          </p>
                        )}
                        {selectedCustomer?.showPriceWithoutTax && (
                          <p className="text-sm font-medium">
                            Tuote yhteensä (ALV 0 %):
                            {' '}
                            {formatNumber(parseDecimal(item.amount || '0').mul(parseDecimal(item.price0 || '0')))}
                            {' '}
                            €
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="mt-4 text-right">
                <Button variant="outline" type="button" onClick={handleAddItem} size="sm" disabled={status !== 'WAITING_FOR_DELIVERY'}>
                  <Plus className="mr-2 h-4 w-4" />
                  Lisää tuote
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  {orderItems.length}
                  {' '}
                  rivi
                  {orderItems.length !== 1 ? 'ä' : ''}
                  {' '}
                  tilauksessa
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Tilauksen kokonaissumma (sis. ALV 14 %)</p>
                <p className="text-2xl font-bold">
                  {formatNumber(calculateTotal())}
                  {' '}
                  €
                </p>
              </div>
            </CardFooter>
          </Card>

        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 static bg-transparent border-0 p-0">
          <div className="flex justify-end gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
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
                      Tallennetaan...
                    </>
                  )
                : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Tallenna
                    </>
                  )}
            </Button>
          </div>
        </div>
      </form>
    </SiikliPage>
  )
}
