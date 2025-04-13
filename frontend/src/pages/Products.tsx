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
  DialogTrigger,
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
import { FullProductDto, ProductTypeResponse } from "@/types/types"
import { formatMoneyFi } from "@/utils/money"
import axios from "axios"

// Pakkausvaihtoehdot
const pakkausvaihtoehdot = ["S", "A", "Ltk"]

export default function TuotteetSivu() {
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<FullProductDto[]>([])
  const [productTypes, setProductTypes] = useState<ProductTypeResponse[]>([])

  const [muokattavaproduct, setMuokattavaproduct] = useState<FullProductDto | null>(null)
  const [newProduct, setnewProduct] = useState<Partial<FullProductDto>>({})
  const [naytaLisaaDialog, setNaytaLisaaDialog] = useState(false)
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

  // Järjestysnumeron muuttaminen
  const muutaorderIndexa = (id: string, suunta: "up" | "down") => {
    const productIndex = products.findIndex((t) => t.id === id)
    if (productIndex === -1) return

    const vaihdettavaIndex = suunta === "up" ? productIndex - 1 : productIndex + 1

    // Tarkista, että vaihdettava indeksi on sallitulla alueella
    if (vaihdettavaIndex < 0 || vaihdettavaIndex >= products.length) return

    const paivitetytTuotteet = [...products]

    // Vaihda järjestysnumerot
    const temp = paivitetytTuotteet[productIndex].orderIndex
    paivitetytTuotteet[productIndex].orderIndex = paivitetytTuotteet[vaihdettavaIndex].orderIndex
    paivitetytTuotteet[vaihdettavaIndex].orderIndex = temp

    // Järjestä tuotteet uudelleen järjestysnumeron mukaan
    paivitetytTuotteet.sort((a, b) => a.orderIndex - b.orderIndex)

    setProducts(paivitetytTuotteet)

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

  const createProduct = async () => {
    if (!newProduct.name || !newProduct.type) {
      toast({
        title: "Virhe",
        description: "Nimi ja tuoteryhmä ovat pakollisia tietoja.",
        variant: "destructive",
      })
      return
    }

    const price0 = Number(((newProduct.price || 0) / 1.24).toFixed(2))

    await axios.post('/products', {
      ...newProduct
    })
    const uusiId = (Number.parseInt(products[products.length - 1]?.id || "0") + 1).toString()

    const newProductObjekti: FullProductDto = {
      id: uusiId,
      chain: "",
      orderIndex: products.length + 1,
      info: '',
      name: newProduct.name || "",
      variety: newProduct.variety || "",
      type: newProduct.type || "",
      subtype: newProduct.subtype || "",
      packageSize: newProduct.packageSize || 0,
      packageType: newProduct.packageType || "",
      price: newProduct.price || 0,
      price0: price0,
    }

    setProducts([...products, newProductObjekti])

    // Tyhjennä lomake
    /*
    setnewProduct({
      orderIndex: products.length + 2,
      name: "",
      variety: "",
      type: "",
      subtype: "",
      packageSize: 0,
      packageType: "",
      price: 0,
      price0: 0,
    })
    */

    //setNaytaLisaaDialog(false)

    toast({
      title: "Tuote luotu",
      description: `Tuote "${newProductObjekti.name}" on tallennettu onnistuneesti.`,
    })
  }

  // Tuotteen poistaminen
  const poistaproduct = (id: string) => {
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

            <Dialog open={naytaLisaaDialog} onOpenChange={setNaytaLisaaDialog}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Lisää tuote
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Lisää uusi tuote</DialogTitle>
                  <DialogDescription>
                    Täytä tuotteen tiedot. Pakolliset kentät on merkitty tähdellä (*).
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="font-medium">
                        Nimi *
                      </Label>
                      <Input
                        id="name"
                        value={newProduct?.name || ""}
                        onChange={(e) => setnewProduct({ ...newProduct, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="variety" className="font-medium">
                        Lajike
                      </Label>
                      <Input
                        id="variety"
                        value={newProduct.variety || ""}
                        onChange={(e) => setnewProduct({ ...newProduct, variety: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type" className="font-medium">
                        Tuoteryhmä *
                      </Label>
                      <Select value={newProduct.type} onValueChange={handletypeChange}>
                        <SelectTrigger id="type">
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
                      <Label htmlFor="subtype" className="font-medium">
                        Aliryhmä
                      </Label>
                      <Select
                        value={newProduct.subtype ?? undefined}
                        onValueChange={(value) => setnewProduct({ ...newProduct, subtype: value })}
                        disabled={!newProduct.type}
                      >
                        <SelectTrigger id="subtype">
                          <SelectValue placeholder="Valitse aliryhmä" />
                        </SelectTrigger>
                        <SelectContent>
                          {productTypes.find(t => t.type === newProduct.type)?.subtypes.map(subType => (
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
                      <Label htmlFor="price" className="font-medium">
                        Hinta (€)
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={newProduct.price || ""}
                        onChange={(e) =>
                          setnewProduct({ ...newProduct, price: Number.parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="packageSize" className="font-medium">
                        Pakkauskoko (kg)
                      </Label>
                      <Input
                        id="packageSize"
                        type="number"
                        step="0.01"
                        min="0"
                        value={newProduct.packageSize || ""}
                        onChange={(e) =>
                          setnewProduct({
                            ...newProduct,
                            packageSize: Number.parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="packageType" className="font-medium">
                        Pakkaustyyppi
                      </Label>
                      <Select
                        value={newProduct.packageType ?? undefined}
                        onValueChange={(value) => setnewProduct({ ...newProduct, packageType: value })}
                      >
                        <SelectTrigger id="packageType">
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
                      <Label htmlFor="price" className="font-medium">
                        Hinta ALV 14 % (€)
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={newProduct.price || ""}
                        onChange={(e) =>
                          setnewProduct({ ...newProduct, price: Number.parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price0" className="font-medium">
                        Hinta ALV 0 % (€)
                      </Label>
                      <Input
                        id="price0"
                        type="number"
                        step="0.01"
                        min="0"
                        value={newProduct.price ? (newProduct.price / 1.24).toFixed(2) : ""}
                        disabled
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-muted-foreground">Lasketaan automaattisesti (ALV 24%)</p>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setNaytaLisaaDialog(false)}>
                    Peruuta
                  </Button>
                  <Button type="button" onClick={createProduct}>
                    <Save className="h-4 w-4 mr-2" />
                    Tallenna
                  </Button>
                </DialogFooter>
              </DialogContent>
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
                                      onClick={() => muutaorderIndexa(product.id, "up")}
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
                                      onClick={() => muutaorderIndexa(product.id, "down")}
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
                                    onClick={() => poistaproduct(product.id)}
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
      </main>
      {/* Muokkausdialogi */}
      <Dialog open={naytaMuokkaaDialog} onOpenChange={setNaytaMuokkaaDialog}>
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
      </Dialog>
    </>
  )
}
