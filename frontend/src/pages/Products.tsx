"use client"

import {
  ChevronDown,
  ChevronUp,
  Edit,
  Filter,
  Plus,
  Trash2
} from "lucide-react"
import { useEffect, useState } from "react"

import SiikliPage from "@/SiikliPage"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogTrigger
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { GetProductResponseDto, ProductTypeResponse, ReorderDto } from "@/types/types"
import { formatMoneyFi } from "@/utils/money"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import NewProduct from "./NewProduct"

// Pakkausvaihtoehdot
const pakkausvaihtoehdot = ["S", "A", "Ltk"]

export default function TuotteetSivu() {
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<GetProductResponseDto[]>([])
  const [productTypes, setProductTypes] = useState<ProductTypeResponse[]>([])

  const [showNewProductDialog, setShowNewProductDialog] = useState(false)
  const [editProductId, setEditProductId] = useState<string>()

  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [orderDirection, setOrderDirection] = useState<"asc" | "desc">("asc")
  const [orderByField, setOrderByField] = useState<keyof GetProductResponseDto>("orderIndex")

  const { toast } = useToast()

  console.log('searchQuery', setSearchQuery)

  const navigate = useNavigate()

  useEffect(() => {
    const loadData = async () => {
      const promises = await Promise.all([axios.get<GetProductResponseDto[]>('/products'), axios.get<ProductTypeResponse[]>('/products/product-types')])
      setProducts(promises[0].data)
      setProductTypes(promises[1].data)
      setLoading(false)
    }
    loadData()

  }, [])

  // Suodata ja järjestä tuotteet
  const filteredTuotteet = products
    .filter((product) => {
      // Haku
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.variety?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.type?.toLowerCase().includes(searchQuery.toLowerCase())

      // productryhmäsuodatus
      const matchesCategory = typeFilter === "all" || product.type === typeFilter

      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      // Järjestäminen
      if (typeof a[orderByField] === "string" && typeof b[orderByField] === "string") {
        return orderDirection === "asc"
          ? (a[orderByField] as string).localeCompare(b[orderByField] as string)
          : (b[orderByField] as string).localeCompare(a[orderByField] as string)
      } else {
        return orderDirection === "asc"
          ? (a[orderByField] as number) - (b[orderByField] as number)
          : (b[orderByField] as number) - (a[orderByField] as number)
      }
    })

  const changeOrderIndex = async (id: string, direction: "up" | "down") => {
    const productIndex = products.find((t) => t.id === id)?.orderIndex as number
    if (productIndex === -1) return

    const indexToChange = direction === "up" ? productIndex - 1 : productIndex + 1

    if (indexToChange < 0 || indexToChange >= products.length) return

    const updatedProducts = [...products]

    // Swap order indexes
    const temp = updatedProducts[productIndex].orderIndex
    updatedProducts[productIndex].orderIndex = updatedProducts[indexToChange].orderIndex
    updatedProducts[indexToChange].orderIndex = temp

    // Reorder products
    updatedProducts.sort((a, b) => a.orderIndex - b.orderIndex)

    const payload: ReorderDto = {
      first: {
        id: updatedProducts[productIndex].id,
        orderIndex: updatedProducts[productIndex].orderIndex
      },
      second: {
        id: updatedProducts[indexToChange].id,
        orderIndex: updatedProducts[indexToChange].orderIndex
      }
    }
    await axios.post('/products/reorder', payload)

    setProducts(updatedProducts)

    toast({
      title: "Järjestys päivitetty",
      description: `Tuotteen "${products[productIndex].name}" järjestys muutettu.`,
    })
  }

  const onProductSaved = async (product: GetProductResponseDto) => {
    if (showNewProductDialog) {
      setProducts([...products, product])
      setShowNewProductDialog(false)
      toast({
        title: "Tuote luotu",
        description: `Tuote "${product.name}" on tallennettu onnistuneesti.`,
        variant: 'success'
      })
    } else {
      const newProducts = [...products.filter(p => p.id !== product.id), product]
      setProducts(newProducts)
      setEditProductId(undefined)
      toast({
        title: "Muutokset tallennettu",
        description: `Tuote "${product.name}" on tallennettu onnistuneesti.`,
      })
    }


  }

  const deleteProduct = async (id: string) => {
    const product = products.find(p => p.id === id)
    if (!product) {
      return
    }

    try {
      await axios.delete('/products/' + id)

      const newProductList = products.filter((t) => t.id !== id)

      setProducts(newProductList)

      toast({
        title: "Tuote poistettu",
        description: `Tuote "${product.name}" on poistettu onnistuneesti.`,
      })
    } catch (e) {
      toast({
        title: "Poistaminen epäonnistui",
        description: `Tuotetta "${product.name}" ei voitu poistaa, koska se on jo lisätty tilaukseen.`,
        variant: 'destructive'
      })
    }
  }

  // Järjestyksen vaihtaminen
  const vaihdaJarjestys = (kentta: keyof GetProductResponseDto) => {
    if (orderByField === kentta) {
      setOrderDirection(orderDirection === "asc" ? "desc" : "asc")
    } else {
      setOrderByField(kentta)
      setOrderDirection("asc")
    }
  }

  if (loading) return <SiikliPage title="Tuotteet" description="Hallitse tuotteita ja hintoja." />

  return (
    <>
      <SiikliPage title="Tuotteet" description="Hallitse tuotteita ja hintoja.">

        <div className="space-y-4">
          {/* Toiminnot ja suodattimet */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex flex-1 items-center gap-2">
              <Input className="h-8 w-full md:w-[300px]" placeholder="Hae tuotetta" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-1">
                    <Filter className="h-4 w-4 mr-1" />
                    Tuoteryhmä: {typeFilter === "all" ? "Kaikki" : typeFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setTypeFilter("all")}>
                    Kaikki tuoteryhmät
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {productTypes.map((productType) => (
                    <DropdownMenuItem key={productType.name} onClick={() => setTypeFilter(productType.name)}>
                      {productType.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant='outline' onClick={() => navigate('/products/reorder')}>Järjestele ryhmät</Button>
            </div>
            <Dialog open={showNewProductDialog} onOpenChange={setShowNewProductDialog}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Lisää tuote
                </Button>
              </DialogTrigger>
              {showNewProductDialog &&
                <NewProduct hide={() => setShowNewProductDialog(false)} onSave={onProductSaved} productTypes={productTypes} packageSizes={pakkausvaihtoehdot} orderIndex={Math.max(...products.map(p => p.orderIndex)) + 1} />}
            </Dialog>
          </div>


          {/* producttaulukko */}
          <Card className="shadow-md">
            <CardHeader className="border-b bg-gray-50 py-4">
              <CardTitle>Tuoteluettelo</CardTitle>
              <CardDescription>
                {filteredTuotteet.length} tuotetta {products.length} tuotteesta
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="w-[80px]">Järjestys</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => vaihdaJarjestys("name")}>
                      <div className="flex items-center">
                        Nimi
                        {orderByField === "name" &&
                          (orderDirection === "asc" ? (
                            <ChevronUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ChevronDown className="ml-1 h-4 w-4" />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead>Lajike</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => vaihdaJarjestys("type")}>
                      <div className="flex items-center">
                        Tuoteryhmä
                        {orderByField === "type" &&
                          (orderDirection === "asc" ? (
                            <ChevronUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ChevronDown className="ml-1 h-4 w-4" />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead>Aliryhmä</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => vaihdaJarjestys("price")}>
                      <div className="flex items-center">
                        Hinta ALV 14 % (€)
                        {orderByField === "price" &&
                          (orderDirection === "asc" ? (
                            <ChevronUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ChevronDown className="ml-1 h-4 w-4" />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead>Hinta ALV 0 % (€)</TableHead>
                    <TableHead>Pakkauskoko</TableHead>
                    <TableHead>Pakkaus</TableHead>
                    <TableHead className="text-right">Toiminnot</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTuotteet.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        Ei tuotteita hakuehdoilla
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTuotteet.map((product, index) => (
                      <TableRow key={product.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <TableCell>
                          <div className="flex items-center">
                            <span className="font-medium mr-2">{product.orderIndex + 1}</span>
                            <div className="flex flex-col">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => changeOrderIndex(product.id, "up")}
                                      disabled={product.orderIndex === 1}
                                    >
                                      <ChevronUp className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Siirrä ylöspäin</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => changeOrderIndex(product.id, "down")}
                                      disabled={product.orderIndex === products.length}
                                    >
                                      <ChevronDown className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Siirrä alaspäin</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.variety}</TableCell>
                        <TableCell>{product.type}</TableCell>
                        <TableCell>{product.subtype}</TableCell>
                        <TableCell className="font-medium">{product.price ? formatMoneyFi(product.price) : ''}</TableCell>
                        <TableCell>{product.price0 ? formatMoneyFi(product.price0) : ''}</TableCell>
                        <TableCell>{product.packageSize ? product.packageSize + ' kg' : ''}</TableCell>
                        <TableCell>{product.packageType}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setEditProductId(product.id)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Muokkaa</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => deleteProduct(product.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Poista</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between border-t bg-gray-50 py-3">
              <div className="text-sm text-muted-foreground">
                Näytetään {filteredTuotteet.length} / {products.length} tuotetta
              </div>
            </CardFooter>
          </Card>
        </div>
      </SiikliPage>
      < Dialog open={editProductId !== undefined} onOpenChange={() => setEditProductId(undefined)} >
        {editProductId &&
          <NewProduct productToEdit={products.find(p => p.id === editProductId)} hide={() => setEditProductId(undefined)} onSave={onProductSaved} productTypes={productTypes} packageSizes={pakkausvaihtoehdot} />}
      </Dialog>
    </>
  )
}
