"use client"

import {
  ChevronDown,
  ChevronUp,
  Edit,
  Filter,
  Plus,
  Save,
  Trash2
} from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { FullProductDto, ProductTypeResponse, ReorderDto } from "@/types/types"
import { formatMoneyFi } from "@/utils/money"
import axios from "axios"
import NewProduct from "./NewProduct"

// Pakkausvaihtoehdot
const pakkausvaihtoehdot = ["S", "A", "Ltk"]

export default function TuotteetSivu() {
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<FullProductDto[]>([])
  const [productTypes, setProductTypes] = useState<ProductTypeResponse[]>([])

  const [muokattavaproduct, setMuokattavaproduct] = useState<FullProductDto | null>(null)
  const [newProduct, setnewProduct] = useState<Partial<FullProductDto>>({})
  const [showNewProductDialog, setShowNewProductDialog] = useState(false)
  const [naytaMuokkaaDialog, setNaytaMuokkaaDialog] = useState(false)
  const [typeFilter, settypeFilter] = useState<string>("kaikki")
  const [jarjestys, setJarjestys] = useState<"asc" | "desc">("asc")
  const [jarjestysKentta, setJarjestysKentta] = useState<keyof FullProductDto>("orderIndex")

  const { toast } = useToast()


  useEffect(() => {
    const loadData = async () => {
      const promises = await Promise.all([axios.get<FullProductDto[]>('/products'), axios.get<ProductTypeResponse[]>('/products/product-types')])
      setProducts(promises[0].data)
      setProductTypes(promises[1].data)
      setLoading(false)
    }
    loadData()

  }, [])

  /*
  useEffect(() => {
    if (!newProduct) {
      return
    }
    if (muokattavaproduct?.type) {
      setProductSubTypes(subtypet[muokattavaproduct.type as keyof typeof subtypet] || [])
    } else if (newProduct.type) {
      setProductSubTypes(subtypet[newProduct.type as keyof typeof subtypet] || [])
    } else {
      setProductSubTypes([])
    }
  }, [muokattavaproduct?.type, newProduct.type])
  */

  // Suodata ja järjestä tuotteet
  const filteredTuotteet = products
    .filter((product) => {
      // Haku
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.variety.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.type.toLowerCase().includes(searchQuery.toLowerCase())

      // productryhmäsuodatus
      const matchesCategory = typeFilter === "kaikki" || product.type === typeFilter

      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      // Järjestäminen
      if (typeof a[jarjestysKentta] === "string" && typeof b[jarjestysKentta] === "string") {
        return jarjestys === "asc"
          ? (a[jarjestysKentta] as string).localeCompare(b[jarjestysKentta] as string)
          : (b[jarjestysKentta] as string).localeCompare(a[jarjestysKentta] as string)
      } else {
        return jarjestys === "asc"
          ? (a[jarjestysKentta] as number) - (b[jarjestysKentta] as number)
          : (b[jarjestysKentta] as number) - (a[jarjestysKentta] as number)
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

  // Tuotteen muokkaaminen
  const aloitaMuokkaus = (product: FullProductDto) => {
    setMuokattavaproduct({ ...product })
    setNaytaMuokkaaDialog(true)
  }

  const updateProduct = async () => {
    if (!muokattavaproduct) return

    // Laske ALV 0% price (24% ALV)
    const price0 = Number((muokattavaproduct.price / 1.24).toFixed(2))

    await axios.post('/products/' + muokattavaproduct.id, {
      ...muokattavaproduct
    })

    const paivitetytTuotteet = products.map((t) =>
      t.id === muokattavaproduct.id ? { ...muokattavaproduct, price0 } : t,
    )

    setProducts(paivitetytTuotteet)
    setNaytaMuokkaaDialog(false)

    toast({
      title: "Tuote päivitetty",
      description: `Tuote "${muokattavaproduct.name}" on päivitetty onnistuneesti.`,
    })
  }

  const onNewProductCreated = async (product: FullProductDto) => {
    setProducts([...products, product])

    setShowNewProductDialog(false)

    toast({
      title: "Tuote luotu",
      description: `Tuote "${product.name}" on tallennettu onnistuneesti.`,
    })
  }

  const deleteProduct = async (id: string) => {

    await axios.delete('/products/' + id)

    const poistettavaproduct = products.find((t) => t.id === id)
    if (!poistettavaproduct) return

    const paivitetytTuotteet = products.filter((t) => t.id !== id)

    // Päivitä järjestysnumerot
    const jarjestetytTuotteet = paivitetytTuotteet.map((product, index) => ({
      ...product,
      orderIndex: index + 1,
    }))

    setProducts(jarjestetytTuotteet)

    toast({
      title: "Tuote poistettu",
      description: `Tuote "${poistettavaproduct.name}" on poistettu onnistuneesti.`,
    })
  }

  // Järjestyksen vaihtaminen
  const vaihdaJarjestys = (kentta: keyof FullProductDto) => {
    if (jarjestysKentta === kentta) {
      setJarjestys(jarjestys === "asc" ? "desc" : "asc")
    } else {
      setJarjestysKentta(kentta)
      setJarjestys("asc")
    }
  }

  // productryhmän vaihtaminen (muokkaustilassa)
  const handletypeChange = (value: string) => {
    if (muokattavaproduct) {
      setMuokattavaproduct({
        ...muokattavaproduct,
        type: value,
        subtype: "", // Tyhjennä aliproductryhmä, koska se riippuu productryhmästä
      })
    } else {
      setnewProduct({
        ...newProduct,
        type: value,
        subtype: "", // Tyhjennä aliproductryhmä, koska se riippuu productryhmästä
      })
    }
  }

  if (loading) {
    return <div></div>
  }

  return (
    <>
      <main className="flex-1 overflow-auto p-6">
        <div className="space-y-6 max-w-7xl mx-auto">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Tuotteet</h1>
            <p className="text-gray-600 mt-1">Hallitse tuotteita ja hintoja</p>
          </div>

          {/* Toiminnot ja suodattimet */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex flex-wrap gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-1">
                    <Filter className="h-4 w-4 mr-1" />
                    Tuoteryhmä: {typeFilter === "kaikki" ? "Kaikki" : typeFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => settypeFilter("kaikki")}>
                    Kaikki tuoteryhmät
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {productTypes.map((productType) => (
                    <DropdownMenuItem key={productType.type} onClick={() => settypeFilter(productType.type)}>
                      {productType.type}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <Dialog open={showNewProductDialog} onOpenChange={setShowNewProductDialog}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Lisää tuote
              </Button>
            </DialogTrigger>
            {showNewProductDialog &&
              <NewProduct hide={() => setShowNewProductDialog(false)} onCreated={onNewProductCreated} productTypes={productTypes} packageSizes={pakkausvaihtoehdot} />}
          </Dialog>

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
                        {jarjestysKentta === "name" &&
                          (jarjestys === "asc" ? (
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
                        {jarjestysKentta === "type" &&
                          (jarjestys === "asc" ? (
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
                        {jarjestysKentta === "price" &&
                          (jarjestys === "asc" ? (
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
                            <span className="font-medium mr-2">{product.orderIndex}</span>
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
                        <TableCell className="font-medium">{formatMoneyFi(product.price)}</TableCell>
                        <TableCell>{formatMoneyFi(product.price0)}</TableCell>
                        <TableCell>{product.packageSize} kg</TableCell>
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
                                    onClick={() => aloitaMuokkaus(product)}
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
      </main >
      {/* Muokkausdialogi */}
      < Dialog open={naytaMuokkaaDialog} onOpenChange={setNaytaMuokkaaDialog} >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Muokkaa tuotetta</DialogTitle>
            <DialogDescription>Muokkaa tuotteen tietoja. Pakolliset kentät on merkitty tähdellä (*).</DialogDescription>
          </DialogHeader>
          {muokattavaproduct && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name" className="font-medium">
                    Nimi *
                  </Label>
                  <Input
                    id="edit-name"
                    value={muokattavaproduct.name}
                    onChange={(e) => setMuokattavaproduct({ ...muokattavaproduct, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-variety" className="font-medium">
                    Lajike
                  </Label>
                  <Input
                    id="edit-variety"
                    value={muokattavaproduct.variety}
                    onChange={(e) => setMuokattavaproduct({ ...muokattavaproduct, variety: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-type" className="font-medium">
                    Tuoteryhmä *
                  </Label>
                  <Select value={muokattavaproduct.type} onValueChange={handletypeChange}>
                    <SelectTrigger id="edit-type">
                      <SelectValue placeholder="Valitse tuoteryhmä" />
                    </SelectTrigger>
                    <SelectContent>
                      {productTypes.map((productType) => (
                        <SelectItem key={productType.type} value={productType.type}>
                          {productType.type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-subtype" className="font-medium">
                    Aliryhmä
                  </Label>
                  <Select
                    value={muokattavaproduct.subtype ?? undefined}
                    onValueChange={(value) => setMuokattavaproduct({ ...muokattavaproduct, subtype: value })}
                  >
                    <SelectTrigger id="edit-subtype">
                      <SelectValue placeholder="Valitse aliryhmä" />
                    </SelectTrigger>
                    <SelectContent>
                      {productTypes.find(t => t.type === muokattavaproduct.type)?.subtypes.map(subType => (
                        <SelectItem key={subType} value={subType}>
                          {subType}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-price" className="font-medium">
                    Hinta (€)
                  </Label>
                  <Input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={muokattavaproduct.price}
                    onChange={(e) =>
                      setMuokattavaproduct({ ...muokattavaproduct, price: Number.parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-packageSize" className="font-medium">
                    Pakkauskoko (kg)
                  </Label>
                  <Input
                    id="edit-packageSize"
                    type="number"
                    step="0.01"
                    min="0"
                    value={muokattavaproduct.packageSize ?? undefined}
                    onChange={(e) =>
                      setMuokattavaproduct({
                        ...muokattavaproduct,
                        packageSize: Number.parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-packageType" className="font-medium">
                    Pakkaustyyppi
                  </Label>
                  <Select
                    value={muokattavaproduct.packageType ?? undefined}
                    onValueChange={(value) => setMuokattavaproduct({ ...muokattavaproduct, packageType: value })}
                  >
                    <SelectTrigger id="edit-packageType">
                      <SelectValue placeholder="Valitse pakkaus" />
                    </SelectTrigger>
                    <SelectContent>
                      {pakkausvaihtoehdot.map((pakkaus) => (
                        <SelectItem key={pakkaus} value={pakkaus}>
                          {pakkaus}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-price" className="font-medium">
                    Hinta ALV 14 % (€)
                  </Label>
                  <Input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={muokattavaproduct.price}
                    onChange={(e) =>
                      setMuokattavaproduct({ ...muokattavaproduct, price: Number.parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-price0" className="font-medium">
                    Hinta ALV 0 % (€)
                  </Label>
                  <Input
                    id="edit-price0"
                    type="number"
                    step="0.01"
                    min="0"
                    value={(muokattavaproduct.price / 1.24).toFixed(2)}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-muted-foreground">Lasketaan automaattisesti (ALV 14 %)</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setNaytaMuokkaaDialog(false)}>
              Peruuta
            </Button>
            <Button type="button" onClick={updateProduct}>
              <Save className="h-4 w-4 mr-2" />
              Tallenna muutokset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog >
    </>
  )
}
