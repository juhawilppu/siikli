import type React from "react"

import {
  Calendar,
  Plus,
  Save,
  X
} from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import axios from "axios"
import { format } from "date-fns"
import { fi } from 'date-fns/locale'
import { useParams } from "react-router-dom"

const packageSizes = [12, 20, 25, 120, 200, 250]
const packageTypes = ['Ltk', 'SS', 'A', 'Ap', 'P', 'Pnt', 'PSS', 'HYV']


export interface ProductDto {
  id: string
  chain: string
  name: string
  price: number
}


interface OrderItem {
  id: string
  productId: string
  amount: number
  packageSize: number
  packageType: string
  packages: number
  price: number
  notes: string
}

export default function CreateOrder() {
  const [deliveryDate, setDeliveryDate] = useState<Date>()
  const [customers, setCustomers] = useState<CustomerDto[]>()
  const [products, setProducts] = useState<ProductDto[]>()
  const [customerId, setCustomerId] = useState<string>("")
  const [hasWaybillNote, setHasWaybillNote] = useState<boolean>()
  const [waybillNote, setWaybillNote] = useState({ title: "", content: "" })
  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    {
      id: "1",
      productId: "",
      amount: 0,
      packageSize: 0,
      packageType: "",
      packages: 0,
      price: 0,
      notes: "",
    },
  ])

  const { orderId } = useParams()

  const handleAddItem = () => {
    setOrderItems([
      ...orderItems,
      {
        id: Date.now().toString(),
        productId: "",
        amount: 0,
        packageSize: 0,
        packageType: "",
        packages: 0,
        price: 0,
        notes: "",
      },
    ])
  }

  useEffect(() => {
    const loadData = async () => {

      const promises = await Promise.all([
        axios.get('/customers'),
        axios.get('/products')
      ])

      setCustomers(promises[0].data)
      setProducts(promises[1].data)

      if (orderId) {
        console.log('has orderId')
        const res = await axios.get<any>(`/orders/${orderId}`)
        setOrderItems(res.data.products)
        setCustomerId(res.data.customerId)
        console.log('settins customerId to ' + res.data.customerId)
        setDeliveryDate(moment(res.data.deliveryDate, 'YYYY-MM-DD'))
        setHasWaybillNote(res.data.hasNote)
        setWaybillNote({ title: res.data.noteHeader, content: res.data.noteBody })
      }
    }
    loadData()
  }, [])

  const handleRemoveItem = (id: string) => {
    if (orderItems.length > 1) {
      setOrderItems(orderItems.filter((item) => item.id !== id))
    }
  }

  const handleItemChange = (id: string, field: keyof OrderItem, value: any) => {
    setOrderItems(
      orderItems.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }

          // If product changed, update price and package details
          if (field === "productId") {
            const product = products.find((p) => p.id === value)
            if (product) {
              updatedItem.price = product.price
              updatedItem.packageSize = product.packageSize
              updatedItem.packageType = product.packageType
            }
          }

          // Recalculate packages if amount or package size changed
          if (field === "amount" || field === "packageSize") {
            if (updatedItem.packageSize > 0) {
              updatedItem.packages = Math.ceil(updatedItem.amount / updatedItem.packageSize)
            }
          }

          return updatedItem
        }
        return item
      }),
    )
  }

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + item.amount * item.price, 0).toFixed(2)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically save the order to your backend
    console.log("Saving order:", {
      customer: selectedCustomer,
      deliveryDate,
      waybillNote,
      items: orderItems,
      total: calculateTotal(),
    })
    // Show success message or handle errors
  }

  if (!customers) {
    return <div></div>
  }

  const selectedCustomer = customers.find((c) => c.id === customerId)

  return (
    <main className="flex-1 overflow-auto p-6">
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Uusi tilaus</h1>
            <p className="text-muted-foreground">Fill in the details to create a new customer order.</p>
          </div>
          <Button variant="outline" onClick={() => window.history.back()}>
            Peruuta
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Customer and Delivery Information */}
            <Card>
              <CardHeader>
                <CardTitle>Tilaukset tiedot</CardTitle>
                <CardDescription>Täytä tilaukset perustiedot</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="customer">Asiakas</Label>
                    <Select value={customerId} onValueChange={setCustomerId}>
                      <SelectTrigger id="customer">
                        <SelectValue placeholder="Valitse asiakas" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.chain} {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedCustomer && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {selectedCustomer.streetAddress}, {selectedCustomer.postalCode} {selectedCustomer.city}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="delivery-date">Toimituspäivä</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                          id="delivery-date"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {deliveryDate
                            ? format(deliveryDate, "d.M.yyyy", { locale: fi })
                            : <span>Valitse päivä</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent mode="single" selected={deliveryDate} onSelect={setDeliveryDate} initialFocus locale={fi} />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <Separator className="my-4" />
                <h3 className="text-lg font-medium">Kuormakirjan huomautus</h3>

                <div className="space-y-2">
                  <Label htmlFor="note-title">Otsikko</Label>
                  <Input
                    id="note-title"
                    value={waybillNote.title}
                    onChange={(e) => setWaybillNote({ ...waybillNote, title: e.target.value })}
                    placeholder="Otsikko"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note-content">Sisältö</Label>
                  <Textarea
                    id="note-content"
                    value={waybillNote.content}
                    onChange={(e) => setWaybillNote({ ...waybillNote, content: e.target.value })}
                    placeholder="Sisältö, esim. toimitusohjeita"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Tuotteet</CardTitle>
                  <CardDescription>Täytä tilaukset tuotteet</CardDescription>
                </div>
                <Button type="button" onClick={handleAddItem} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Lisää tuote
                </Button>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-[500px]">
                  <div className="space-y-4">
                    {orderItems.map((item, index) => (
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
                            <Label htmlFor={`product-${item.id}`}>Tuote</Label>
                            <Select
                              value={item.productId}
                              onValueChange={(value) => handleItemChange(item.id, "productId", value)}
                            >
                              <SelectTrigger id={`product-${item.id}`}>
                                <SelectValue placeholder="Valitse tuote" />
                              </SelectTrigger>
                              <SelectContent>
                                {products.map((product) => (
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
                              value={item.amount || ""}
                              onChange={(e) =>
                                handleItemChange(item.id, "amount", Number.parseFloat(e.target.value) || 0)
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`price-${item.id}`}>Hinta (€/kg) ALV 14 %</Label>
                            <Input
                              id={`price-${item.id}`}
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.price || ""}
                              onChange={(e) =>
                                handleItemChange(item.id, "price", Number.parseFloat(e.target.value) || 0)
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`package-type-${item.id}`}>Pakkauskoko</Label>
                            <Select
                              value={item.packageSize + ''}
                              onValueChange={(value) => handleItemChange(item.id, "packageSize", parseInt(value))}
                            >
                              <SelectTrigger id={`package-size-${item.id}`}>
                                <SelectValue placeholder="Valitse pakkauskoko" />
                              </SelectTrigger>
                              <SelectContent>
                                {packageSizes.map(type => (
                                  <SelectItem value={type + ''}>{type}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`package-type-${item.id}`}>Pakkaustyyppi</Label>
                            <Select
                              value={item.packageType}
                              onValueChange={(value) => handleItemChange(item.id, "packageType", value)}
                            >
                              <SelectTrigger id={`package-type-${item.id}`}>
                                <SelectValue placeholder="Valitse pakkaustyyppi" />
                              </SelectTrigger>
                              <SelectContent>
                                {packageTypes.map(type => (
                                  <SelectItem value={type}>{type}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`packages-${item.id}`}>Kappaletta</Label>
                            <Input
                              id={`packages-${item.id}`}
                              type="number"
                              min="0"
                              value={item.packages || ""}
                              readOnly
                              className="bg-muted"
                            />
                            <p className="text-xs text-muted-foreground">
                              Calculated: {item.amount} / {item.packageSize}
                            </p>
                          </div>

                          <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                            <Label htmlFor={`notes-${item.id}`}>Lisätieto</Label>
                            <Input
                              id={`notes-${item.id}`}
                              value={item.notes}
                              onChange={(e) => handleItemChange(item.id, "notes", e.target.value)}
                              placeholder="Lisätietoa tästä tuotteesta"
                            />
                          </div>
                        </div>

                        <div className="mt-4 text-right">
                          <p className="text-sm font-medium">
                            Item Total: €{(item.amount * item.price).toFixed(2)}
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
                    {orderItems.length} item{orderItems.length !== 1 ? "s" : ""} in order
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Order Subtotal</p>
                  <p className="text-2xl font-bold">€{calculateTotal()}</p>
                </div>
              </CardFooter>
            </Card>

            <div className="flex justify-end gap-4">
              <Button variant="outline" type="button" onClick={() => window.history.back()}>
                Peruuta
              </Button>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Tallenna
              </Button>
            </div>
          </div>
        </form>
      </div>
    </main>
  )
}

