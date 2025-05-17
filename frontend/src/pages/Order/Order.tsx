import type React from 'react'

import type { CustomerDto, GetCustomersResponseDto, GetOrderDto, GetPackageSettings, GetProductResponseDto, OrderProduct, PostOrderRequestDto, PostOrderResponseDto } from '@/types/types'
import { captureException } from '@sentry/react'

import axios from 'axios'
import { format } from 'date-fns'
import { fi } from 'date-fns/locale'
import {
  Calendar,
  Check,
  ChevronsUpDown,
  Plus,
  Save,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink, useNavigate, useParams } from 'react-router-dom'
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
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import SiikliPage from '@/SiikliPage'
import { dateToString } from '@/utils/date'
import { formatMoneyFi } from '@/utils/money'
import ConfirmDialog from '../ConfirmDialog'

export default function CreateOrder() {
  const [customers, setCustomers] = useState<CustomerDto[]>()
  const [products, setProducts] = useState<GetProductResponseDto[]>()
  const [isLoading, setIsLoading] = useState(true)
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
    amount: string // Use string to render with 2 decimal places
    packages: number
    packageSize: number
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
      packageSize: 0,
      packageType: '',
      price: '',
      freetext: '',
      createdAt: new Date(),
    },
  ])

  const { orderId } = useParams()
  const navigate = useNavigate()
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
      ])

      setCustomers(promises[0].data.customers)
      setProducts(promises[1].data)
      setPackageTypes(promises[2].data.packageTypes)
      setPackageSizes(promises[2].data.packageSizes)
      if (orderId) {
        console.log('has orderId')
        const res = await axios.get<GetOrderDto>(`/orders/${orderId}`)
        setOrderItems(res.data.items.map(item => ({
          ...item,
          price: item.price?.toFixed(2).toString() || '',
          amount: item.amount?.toFixed(2).toString() || '',
          createdAt: new Date(item.createdAt),
        })))
        setCustomerId(res.data.customerId)
        console.log(`settins customerId to ${res.data.customerId}`)
        setDeliveryDate(new Date(res.data.deliveryDate))
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

  const handleItemChange = (id: string, field: keyof OrderProduct, value: any) => {
    if (!products) {
      return
    }
    setOrderItems(
      orderItems.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }

          // If product changed, update price and package details
          if (field === 'productId') {
            const product = products.find(p => p.id === value)
            if (product) {
              updatedItem.price = product.price?.toString() || ''
              updatedItem.packageSize = product.packageSize || 0
              updatedItem.packageType = product.packageType || ''
            }
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

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + (Number.parseFloat(item.amount || '0')) * (Number.parseFloat(item.price || '0')), 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
    const customer = customers.find(c => c.id === customerId)
    if (!customer) {
      return
    }

    const items = orderItems.map(item => ({
      ...item,
      id: item.unsaved ? undefined : item.id,
      price: Number.parseFloat(item.price),
      amount: Number.parseFloat(item.amount),
    }))

    for (const item of items) {
      if (!item.productId) {
        toast({
          title: 'Tuote ei voi olla tyhjä',
          description: 'Valitse tuote tai poista rivi',
          variant: 'destructive',
        })
        setIsSubmitting(false)
        return
      }
      if (!item.amount) {
        toast({
          title: 'Määrä ei voi olla tyhjä',
          description: 'Valitse määrä tai poista rivi',
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
      deliveryDate: dateToString(deliveryDate),
      hasNote: hasWaybillNote,
      noteBody: hasWaybillNote ? waybillNote.content : null,
      noteHeader: hasWaybillNote ? waybillNote.title : null,
      items,
    }
    console.log('Saving order:', data)
    try {
      if (orderId) {
        // Update order
        await axios.post(`/orders/${orderId}`, data)
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
        navigate(`/orders/${res.data.id}`, { replace: false })
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
    setIsSubmitting(false)

    // Show success message or handle errors
  }

  if (isLoading || !customers || !products || !packageTypes || !packageSizes) {
    return <SiikliPage title={orderId ? 'Tilaus' : 'Uusi tilaus'} description="Täytä tilauksen tiedot" />
  }

  if (customers.length === 0 || products.length === 0) {
    return (
      <SiikliPage
        title={orderId ? 'Tilaus' : 'Uusi tilaus'}
        description="Täytä tilauksen tiedot"
        mainAction={(
          <Button variant="outline" onClick={() => window.history.back()}>
            Peruuta
          </Button>
        )}
      >
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-6 text-center">
          <div className="text-4xl">📦</div>
          <div className="space-y-3">
            {customers.length === 0 && (
              <div className="text-sm bg-muted rounded-md px-4 py-2">
                👤 Sinulla ei ole vielä asiakkaita.
                {' '}
                👉
                {' '}
                <NavLink to="/customers" className="underline text-primary">
                  Lisää ensimmäinen asiakas
                </NavLink>
                .
              </div>
            )}
            {products.length === 0 && (
              <div className="text-sm bg-muted rounded-md px-4 py-2">
                🥔 Sinulla ei ole vielä tuotteita.
                {' '}
                👉
                {' '}
                <NavLink to="/products" className="underline text-primary">
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

  const selectedCustomer = customers.find(c => c.id === customerId)

  const handleConfirmDelete = () => {
    axios.delete(`/orders/${orderId}`)
    toast({
      title: 'Tilaus poistettu',
      description: 'Tilaus poistettu onnistuneesti',
      variant: 'success',
    })
    navigate('/orders')
  }

  return (
    <SiikliPage
      title={orderId ? 'Tilaus' : 'Uusi tilaus'}
      description="Täytä tilauksen tiedot"
      mainAction={
        !orderId
        && (
          <Button variant="outline" onClick={() => window.history.back()}>
            Peruuta
          </Button>
        )
      }
    >

      {confirmDialog && (
        <ConfirmDialog
          title="Poista tilaus"
          description="Haluatko varmasti poistaa koko tilauksen? Tämä toiminto poistaa tilauksen lopullisesti."
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDialog(false)}
        />
      )}
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Customer and Delivery Information */}
          <Card>
            <CardHeader>
              <CardTitle>Tilauksen perustiedot</CardTitle>
              <CardDescription>Valitse asiakas ja toimituspäivä</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="customer">Asiakas</Label>
                  <div className="flex gap-2">
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
                  </div>
                  {selectedCustomer && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedCustomer.streetAddress}
                      ,
                      {selectedCustomer.postalCode}
                      {' '}
                      {selectedCustomer.city}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delivery-date">Toimituspäivä</Label>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
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
              </div>

              <Separator className="my-4" />
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-waybill"
                  checked={hasWaybillNote}
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
                <CardDescription>Täytä tilauksen tuotteet</CardDescription>
              </div>
              <Button variant="outline" type="button" onClick={handleAddItem} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Lisää tuote
              </Button>
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
                        className="absolute right-2 top-2"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={orderItems.length === 1}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Poista</span>
                      </Button>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor={`product-${item.productId}`}>Tuote</Label>
                          <Select
                            value={item.productId}
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
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.amount || ''}
                            onChange={e =>
                              handleItemChange(item.id, 'amount', Number.parseFloat(e.target.value) || 0)}
                            onBlur={() => {
                              console.log('onBlur', item.amount)
                              handleItemChange(item.id, 'amount', Number.parseFloat(item.amount || '0').toFixed(2))
                            }}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`price-${item.id}`}>Hinta (€/kg) ALV 14 %</Label>
                          <Input
                            id={`price-${item.id}`}
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.price || ''}
                            onChange={e =>
                              handleItemChange(item.id, 'price', Number.parseFloat(e.target.value) || 0)}
                            onBlur={() => {
                              console.log('onBlur', item.price)
                              handleItemChange(item.id, 'price', Number.parseFloat(item.price || '0').toFixed(2))
                            }}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`package-size-${item.id}`}>Pakkauskoko</Label>
                          <Popover open={openPackageSize === item.id} onOpenChange={open => setOpenPackageSize(open ? item.id : undefined)}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                className="w-full justify-between"
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
                                  <button
                                    onClick={() => {
                                      const size = Number(inputValuePackageSize.trim())
                                      if (size && !isNaN(size)) {
                                        handleItemChange(item.id, 'packageSize', size)
                                        setPackageSizes([...packageSizes, size])
                                        setOpenPackageSize(undefined)
                                      }
                                    }}
                                    className="flex items-center space-x-2 text-sm p-2 hover:bg-muted w-full text-left"
                                  >
                                    <Plus className="w-4 h-4" />
                                    <span>
                                      Luo:
                                      {inputValuePackageSize}
                                    </span>
                                  </button>
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
                                  {!packageSizes.includes(Number(inputValuePackageSize)) && (
                                    <div className="p-2 border-t">
                                      <button
                                        onClick={() => {
                                          const size = Number(inputValuePackageSize.trim())
                                          if (size && !isNaN(size)) {
                                            handleItemChange(item.id, 'packageSize', size)
                                            setPackageSizes([...packageSizes, size])
                                            setOpenPackageSize(undefined)
                                          }
                                        }}
                                        className="flex items-center space-x-2 text-sm p-2 hover:bg-muted w-full text-left"
                                      >
                                        <Plus className="w-4 h-4" />
                                        <span>
                                          Luo:
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
                                className="w-full justify-between"
                              >
                                {item.packageType || 'Valitse pakkaustyyppi'}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandInput
                                  placeholder="Syötä pakkaustyyppi..."
                                  onValueChange={value => setInputValuePackageType(value)}
                                />
                                <CommandEmpty>
                                  <button
                                    onClick={() => {
                                      const type = inputValuePackageType.trim()
                                      if (type) {
                                        handleItemChange(item.id, 'packageType', type)
                                        setPackageTypes([...packageTypes, type])
                                        setOpenPackageType(undefined)
                                      }
                                    }}
                                    className="flex items-center space-x-2 text-sm p-2 hover:bg-muted w-full text-left"
                                  >
                                    <Plus className="w-4 h-4" />
                                    <span>
                                      Lisää:
                                      {inputValuePackageType}
                                    </span>
                                  </button>
                                </CommandEmpty>
                                <CommandGroup>
                                  {packageTypes
                                    .filter(type => type.toLowerCase().includes(inputValuePackageType.toLowerCase()))
                                    .sort()
                                    .map(type => (
                                      <CommandItem
                                        key={type}
                                        onSelect={() => {
                                          handleItemChange(item.id, 'packageType', type)
                                          setOpenPackageType(undefined)
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
                                  {!packageTypes.includes(inputValuePackageType) && (
                                    <div className="p-2 border-t">
                                      <button
                                        onClick={() => {
                                          const type = inputValuePackageType.trim()
                                          if (type) {
                                            handleItemChange(item.id, 'packageType', type)
                                            setPackageTypes([...packageTypes, type])
                                            setOpenPackageType(undefined)
                                          }
                                        }}
                                        className="flex items-center space-x-2 text-sm p-2 hover:bg-muted w-full text-left"
                                      >
                                        <Plus className="w-4 h-4" />
                                        <span>
                                          Luo:
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
                            onChange={e => handleItemChange(item.id, 'freetext', e.target.value)}
                            placeholder="Lisätietoa tästä tuotteesta"
                          />
                        </div>
                      </div>

                      <div className="mt-4 text-right">
                        <p className="text-sm font-medium">
                          Tuote yhteensä:
                          {' '}
                          {formatMoneyFi(Number.parseFloat(item.amount || '0') * (Number.parseFloat(item.price || '0')))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
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
                <p className="text-sm text-muted-foreground">Tilauksen kokonaissumma</p>
                <p className="text-2xl font-bold">{formatMoneyFi(calculateTotal())}</p>
              </div>
            </CardFooter>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="destructive" type="button" onClick={() => setConfirmDialog(true)}>
              Poista
            </Button>
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
