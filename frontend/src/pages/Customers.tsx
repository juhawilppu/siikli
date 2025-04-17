import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { CustomerDto } from "@/types/types"
import axios from 'axios'
import {
  ChevronDown,
  Edit,
  Filter,
  Plus,
  Save,
  Trash2
} from "lucide-react"
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'


// Asiakasryhmät
const asiakasryhmat = ["Vähittäiskauppa", "Tukkukauppa", "Ravintola", "Leipomo", "Muu"]

// Ketjut
const ketjut = ["S", "K", "L", "M", "R"]


export const Customers = () => {
  const [customers, setCustomers] = useState<CustomerDto[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [muokattavaAsiakas, setMuokattavaAsiakas] = useState<CustomerDto | null>(null)
  const [uusiAsiakas, setUusiAsiakas] = useState<Partial<CustomerDto>>({
    chain: "",
    name: "",
    compensation: 0,
    show_price_without_tax: false,
    tenantId: "tenant-1",
  })
  const [naytaLisaaDialog, setNaytaLisaaDialog] = useState(false)
  const [naytaMuokkaaDialog, setNaytaMuokkaaDialog] = useState(false)
  const [poistettavaAsiakas, setPoistettavaAsiakas] = useState<string | null>(null)
  const [asiakasryhmaFilter, setAsiakasryhmaFilter] = useState<string>("kaikki")
  const [ketjuFilter, setKetjuFilter] = useState<string>("kaikki")
  const [jarjestys, setJarjestys] = useState<"asc" | "desc">("asc")
  const [jarjestysKentta, setJarjestysKentta] = useState<keyof CustomerDto>("name")
  const [sivu, setSivu] = useState(1)
  const rivejaSivulla = 5
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    axios
      .get('/customers')
      .then((response) => setCustomers(response.data))
      .finally(() => setLoading(false))
  }, [])

  // Suodata ja järjestä asiakkaat
  const filteredAsiakkaat = customers
    .filter((asiakas) => {
      // Haku
      const matchesSearch =
        asiakas.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asiakas.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asiakas.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asiakas.business_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asiakas.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asiakas.phone?.toLowerCase().includes(searchQuery.toLowerCase())

      // Asiakasryhmäsuodatus
      const matchesGroup = asiakasryhmaFilter === "kaikki" || asiakas.customer_group === asiakasryhmaFilter

      // Ketjusuodatus
      const matchesChain = ketjuFilter === "kaikki" || asiakas.chain === ketjuFilter

      return matchesSearch && matchesGroup && matchesChain
    })
    .sort((a, b) => {
      // Järjestäminen
      const aValue = a[jarjestysKentta]
      const bValue = b[jarjestysKentta]

      if (aValue === undefined || bValue === undefined) return 0

      if (typeof aValue === "string" && typeof bValue === "string") {
        return jarjestys === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      } else if (typeof aValue === "number" && typeof bValue === "number") {
        return jarjestys === "asc" ? aValue - bValue : bValue - aValue
      } else if (typeof aValue === "boolean" && typeof bValue === "boolean") {
        return jarjestys === "asc" ? (aValue ? 1 : -1) : bValue ? 1 : -1
      }
      return 0
    })

  // Sivutus
  const sivutetutAsiakkaat = filteredAsiakkaat.slice((sivu - 1) * rivejaSivulla, sivu * rivejaSivulla)
  const sivujenMaara = Math.ceil(filteredAsiakkaat.length / rivejaSivulla)

  // Asiakkaan muokkaaminen
  const aloitaMuokkaus = (asiakas: Asiakas) => {
    setMuokattavaAsiakas({ ...asiakas })
    setNaytaMuokkaaDialog(true)
  }

  const tallennaMuokkaus = () => {
    if (!muokattavaAsiakas) return

    axios
      .put(`/customers/${muokattavaAsiakas.id}`, muokattavaAsiakas)
      .then(() => {
        setCustomers(customers.map((a) => (a.id === muokattavaAsiakas.id ? muokattavaAsiakas : a)))
        setNaytaMuokkaaDialog(false)
        toast({
          title: "Asiakas päivitetty",
          description: `Asiakas "${muokattavaAsiakas.name}" on päivitetty onnistuneesti.`,
        })
      })
      .catch((error) => {
        toast({
          title: "Virhe",
          description: "Asiakkaan päivitys epäonnistui.",
          variant: "destructive",
        })
      })
  }

  // Uuden asiakkaan lisääminen
  const lisaaAsiakas = () => {
    if (!uusiAsiakas.name || !uusiAsiakas.chain) {
      toast({
        title: "Virhe",
        description: "Nimi ja ketju ovat pakollisia tietoja.",
        variant: "destructive",
      })
      return
    }

    const uusiJarjestys = Math.max(...customers.map((a) => a.order_index || 0), 0) + 1
    const uusiAsiakasObjekti: Asiakas = {
      ...uusiAsiakas,
      order_index: uusiJarjestys,
    } as Asiakas

    axios
      .post('/customers', uusiAsiakasObjekti)
      .then((response) => {
        setCustomers([...customers, response.data])
        setNaytaLisaaDialog(false)
        setUusiAsiakas({
          chain: "",
          name: "",
          compensation: 0,
          show_price_without_tax: false,
          tenantId: "tenant-1",
        })
        toast({
          title: "Asiakas lisätty",
          description: `Asiakas "${uusiAsiakasObjekti.name}" on lisätty onnistuneesti.`,
        })
      })
      .catch((error) => {
        toast({
          title: "Virhe",
          description: "Asiakkaan lisäys epäonnistui.",
          variant: "destructive",
        })
      })
  }

  // Asiakkaan poistaminen
  const poistaAsiakas = (id: string) => {
    setPoistettavaAsiakas(id)
  }

  const vahvistaPoisto = () => {
    if (!poistettavaAsiakas) return

    const poistettava = customers.find((a) => a.id === poistettavaAsiakas)
    if (!poistettava) return

    axios
      .delete(`/customers/${poistettavaAsiakas}`)
      .then(() => {
        setCustomers(customers.filter((a) => a.id !== poistettavaAsiakas))
        setPoistettavaAsiakas(null)
        toast({
          title: "Asiakas poistettu",
          description: `Asiakas "${poistettava.name}" on poistettu onnistuneesti.`,
        })
      })
      .catch((error) => {
        toast({
          title: "Virhe",
          description: "Asiakkaan poisto epäonnistui.",
          variant: "destructive",
        })
      })
  }

  // Järjestyksen vaihtaminen
  const vaihdaJarjestys = (kentta: keyof Asiakas) => {
    if (jarjestysKentta === kentta) {
      setJarjestys(jarjestys === "asc" ? "desc" : "asc")
    } else {
      setJarjestysKentta(kentta)
      setJarjestys("asc")
    }
  }

  if (loading) return <div>Loading</div>
  if (!customers) return <div>Ei asiakkaita</div>

  return (
    <>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Asiakkaat</h1>
          <p className="text-gray-600 mt-1">Hallitse asiakastietoja ja asiakassuhteita</p>
        </div>

        {/* Toiminnot ja suodattimet */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-wrap gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-1">
                  <Filter className="h-4 w-4 mr-1" />
                  Asiakasryhmä: {asiakasryhmaFilter === "kaikki" ? "Kaikki" : asiakasryhmaFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setAsiakasryhmaFilter("kaikki")}>
                  Kaikki asiakasryhmät
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {asiakasryhmat.map((ryhma) => (
                  <DropdownMenuItem key={ryhma} onClick={() => setAsiakasryhmaFilter(ryhma)}>
                    {ryhma}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-1">
                  <Filter className="h-4 w-4 mr-1" />
                  Ketju: {ketjuFilter === "kaikki" ? "Kaikki" : ketjuFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setKetjuFilter("kaikki")}>Kaikki ketjut</DropdownMenuItem>
                <DropdownMenuSeparator />
                {ketjut.map((ketju) => (
                  <DropdownMenuItem key={ketju} onClick={() => setKetjuFilter(ketju)}>
                    {ketju}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Dialog open={naytaLisaaDialog} onOpenChange={setNaytaLisaaDialog}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Lisää asiakas
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Lisää uusi asiakas</DialogTitle>
                <DialogDescription>
                  Täytä asiakkaan tiedot. Pakolliset kentät on merkitty tähdellä (*).
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="font-medium">
                      Nimi *
                    </Label>
                    <Input
                      id="name"
                      value={uusiAsiakas.name || ""}
                      onChange={(e) => setUusiAsiakas({ ...uusiAsiakas, name: e.target.value })}
                      maxLength={50}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="chain" className="font-medium">
                      Ketju *
                    </Label>
                    <Select
                      value={uusiAsiakas.chain}
                      onValueChange={(value) => setUusiAsiakas({ ...uusiAsiakas, chain: value })}
                    >
                      <SelectTrigger id="chain">
                        <SelectValue placeholder="Valitse ketju" />
                      </SelectTrigger>
                      <SelectContent>
                        {ketjut.map((ketju) => (
                          <SelectItem key={ketju} value={ketju}>
                            {ketju}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company_name" className="font-medium">
                      Yrityksen nimi
                    </Label>
                    <Input
                      id="company_name"
                      value={uusiAsiakas.company_name || ""}
                      onChange={(e) => setUusiAsiakas({ ...uusiAsiakas, company_name: e.target.value })}
                      maxLength={255}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="business_id" className="font-medium">
                      Y-tunnus
                    </Label>
                    <Input
                      id="business_id"
                      value={uusiAsiakas.business_id || ""}
                      onChange={(e) => setUusiAsiakas({ ...uusiAsiakas, business_id: e.target.value })}
                      maxLength={255}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer_group" className="font-medium">
                      Asiakasryhmä
                    </Label>
                    <Select
                      value={uusiAsiakas.customer_group}
                      onValueChange={(value) => setUusiAsiakas({ ...uusiAsiakas, customer_group: value })}
                    >
                      <SelectTrigger id="customer_group">
                        <SelectValue placeholder="Valitse asiakasryhmä" />
                      </SelectTrigger>
                      <SelectContent>
                        {asiakasryhmat.map((ryhma) => (
                          <SelectItem key={ryhma} value={ryhma}>
                            {ryhma}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="compensation" className="font-medium">
                      Korvaus
                    </Label>
                    <Input
                      id="compensation"
                      type="number"
                      step="0.01"
                      min="0"
                      value={uusiAsiakas.compensation || ""}
                      onChange={(e) =>
                        setUusiAsiakas({
                          ...uusiAsiakas,
                          compensation: Number.parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reference" className="font-medium">
                      Viite
                    </Label>
                    <Input
                      id="reference"
                      value={uusiAsiakas.reference || ""}
                      onChange={(e) => setUusiAsiakas({ ...uusiAsiakas, reference: e.target.value })}
                      maxLength={255}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="order_index" className="font-medium">
                      Järjestysnumero
                    </Label>
                    <Input
                      id="order_index"
                      type="number"
                      min="0"
                      value={uusiAsiakas.order_index || ""}
                      onChange={(e) =>
                        setUusiAsiakas({
                          ...uusiAsiakas,
                          order_index: Number.parseInt(e.target.value) || undefined,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="font-medium">
                    Osoite
                  </Label>
                  <Input
                    id="address"
                    value={uusiAsiakas.address || ""}
                    onChange={(e) => setUusiAsiakas({ ...uusiAsiakas, address: e.target.value })}
                    maxLength={255}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address2" className="font-medium">
                    Osoite 2
                  </Label>
                  <Input
                    id="address2"
                    value={uusiAsiakas.address2 || ""}
                    onChange={(e) => setUusiAsiakas({ ...uusiAsiakas, address2: e.target.value })}
                    maxLength={255}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postal_code" className="font-medium">
                      Postinumero
                    </Label>
                    <Input
                      id="postal_code"
                      value={uusiAsiakas.postal_code || ""}
                      onChange={(e) => setUusiAsiakas({ ...uusiAsiakas, postal_code: e.target.value })}
                      maxLength={5}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="city" className="font-medium">
                      Kaupunki
                    </Label>
                    <Input
                      id="city"
                      value={uusiAsiakas.city || ""}
                      onChange={(e) => setUusiAsiakas({ ...uusiAsiakas, city: e.target.value })}
                      maxLength={255}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-medium">
                      Sähköposti
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={uusiAsiakas.email || ""}
                      onChange={(e) => setUusiAsiakas({ ...uusiAsiakas, email: e.target.value })}
                      maxLength={255}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="font-medium">
                      Puhelin
                    </Label>
                    <Input
                      id="phone"
                      value={uusiAsiakas.phone || ""}
                      onChange={(e) => setUusiAsiakas({ ...uusiAsiakas, phone: e.target.value })}
                      maxLength={255}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id="show_price_without_tax"
                    checked={uusiAsiakas.show_price_without_tax}
                    onCheckedChange={(checked) =>
                      setUusiAsiakas({ ...uusiAsiakas, show_price_without_tax: checked as boolean })
                    }
                  />
                  <Label htmlFor="show_price_without_tax" className="font-medium">
                    Näytä hinnat ilman veroa
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNaytaLisaaDialog(false)}>
                  Peruuta
                </Button>
                <Button type="button" onClick={lisaaAsiakas}>
                  <Save className="h-4 w-4 mr-2" />
                  Tallenna
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Asiakastaulukko */}
        <Card className="shadow-md">
          <CardHeader className="border-b bg-gray-50 py-4">
            <CardTitle>Asiakasluettelo</CardTitle>
            <CardDescription>
              {filteredAsiakkaat.length} asiakasta {customers.length} asiakkaasta
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="w-[60px]">Ketju</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => vaihdaJarjestys("name")}>
                    <div className="flex items-center">
                      Nimi
                      {jarjestysKentta === "name" && (
                        <ChevronDown
                          className={`ml-1 h-4 w-4 ${jarjestys === "asc" ? "rotate-180 transform" : ""}`}
                        />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Yritys</TableHead>
                  <TableHead>Kaupunki</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => vaihdaJarjestys("customer_group")}>
                    <div className="flex items-center">
                      Asiakasryhmä
                      {jarjestysKentta === "customer_group" && (
                        <ChevronDown
                          className={`ml-1 h-4 w-4 ${jarjestys === "asc" ? "rotate-180 transform" : ""}`}
                        />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => vaihdaJarjestys("compensation")}>
                    <div className="flex items-center">
                      Korvaus
                      {jarjestysKentta === "compensation" && (
                        <ChevronDown
                          className={`ml-1 h-4 w-4 ${jarjestys === "asc" ? "rotate-180 transform" : ""}`}
                        />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Yhteystiedot</TableHead>
                  <TableHead className="text-right">Toiminnot</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sivutetutAsiakkaat.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Ei asiakkaita hakuehdoilla
                    </TableCell>
                  </TableRow>
                ) : (
                  sivutetutAsiakkaat.map((asiakas, index) => (
                    <TableRow key={asiakas.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <TableCell className="font-medium">{asiakas.chain}</TableCell>
                      <TableCell className="font-medium">{asiakas.name}</TableCell>
                      <TableCell>{asiakas.company_name}</TableCell>
                      <TableCell>{asiakas.city}</TableCell>
                      <TableCell>{asiakas.customer_group}</TableCell>
                      <TableCell>{asiakas.compensation.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {asiakas.email && (
                            <div>
                              <span className="text-gray-500">Email:</span> {asiakas.email}
                            </div>
                          )}
                          {asiakas.phone && (
                            <div>
                              <span className="text-gray-500">Puh:</span> {asiakas.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => aloitaMuokkaus(asiakas)}
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
                                  onClick={() => poistaAsiakas(asiakas.id)}
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
              Näytetään {(sivu - 1) * rivejaSivulla + 1}-
              {Math.min(sivu * rivejaSivulla, filteredAsiakkaat.length)} / {filteredAsiakkaat.length} asiakasta
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setSivu((prev) => Math.max(prev - 1, 1))}
                    className={sivu === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(5, sivujenMaara) }, (_, i) => {
                  let pageNum = i + 1
                  if (sivujenMaara > 5 && sivu > 3) {
                    pageNum = sivu - 3 + i
                    if (pageNum > sivujenMaara) {
                      pageNum = sivujenMaara - (4 - i)
                    }
                  }
                  return (
                    <PaginationItem key={i}>
                      <PaginationLink
                        onClick={() => setSivu(pageNum)}
                        isActive={sivu === pageNum}
                        className={pageNum > sivujenMaara ? "pointer-events-none opacity-50" : ""}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  )
                })}
                {sivujenMaara > 5 && sivu < sivujenMaara - 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setSivu((prev) => Math.min(prev + 1, sivujenMaara))}
                    className={sivu === sivujenMaara || sivujenMaara === 0 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardFooter>
        </Card>
      </div>

      {/* Muokkausdialogi */}
      <Dialog open={naytaMuokkaaDialog} onOpenChange={setNaytaMuokkaaDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Muokkaa asiakasta</DialogTitle>
            <DialogDescription>
              Muokkaa asiakkaan tietoja. Pakolliset kentät on merkitty tähdellä (*).
            </DialogDescription>
          </DialogHeader>
          {muokattavaAsiakas && (
            <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name" className="font-medium">
                    Nimi *
                  </Label>
                  <Input
                    id="edit-name"
                    value={muokattavaAsiakas.name}
                    onChange={(e) => setMuokattavaAsiakas({ ...muokattavaAsiakas, name: e.target.value })}
                    maxLength={50}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-chain" className="font-medium">
                    Ketju *
                  </Label>
                  <Select
                    value={muokattavaAsiakas.chain}
                    onValueChange={(value) => setMuokattavaAsiakas({ ...muokattavaAsiakas, chain: value })}
                  >
                    <SelectTrigger id="edit-chain">
                      <SelectValue placeholder="Valitse ketju" />
                    </SelectTrigger>
                    <SelectContent>
                      {ketjut.map((ketju) => (
                        <SelectItem key={ketju} value={ketju}>
                          {ketju}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-company_name" className="font-medium">
                    Yrityksen nimi
                  </Label>
                  <Input
                    id="edit-company_name"
                    value={muokattavaAsiakas.company_name || ""}
                    onChange={(e) => setMuokattavaAsiakas({ ...muokattavaAsiakas, company_name: e.target.value })}
                    maxLength={255}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-business_id" className="font-medium">
                    Y-tunnus
                  </Label>
                  <Input
                    id="edit-business_id"
                    value={muokattavaAsiakas.business_id || ""}
                    onChange={(e) => setMuokattavaAsiakas({ ...muokattavaAsiakas, business_id: e.target.value })}
                    maxLength={255}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-customer_group" className="font-medium">
                    Asiakasryhmä
                  </Label>
                  <Select
                    value={muokattavaAsiakas.customer_group || ""}
                    onValueChange={(value) => setMuokattavaAsiakas({ ...muokattavaAsiakas, customer_group: value })}
                  >
                    <SelectTrigger id="edit-customer_group">
                      <SelectValue placeholder="Valitse asiakasryhmä" />
                    </SelectTrigger>
                    <SelectContent>
                      {asiakasryhmat.map((ryhma) => (
                        <SelectItem key={ryhma} value={ryhma}>
                          {ryhma}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-compensation" className="font-medium">
                    Korvaus
                  </Label>
                  <Input
                    id="edit-compensation"
                    type="number"
                    step="0.01"
                    min="0"
                    value={muokattavaAsiakas.compensation}
                    onChange={(e) =>
                      setMuokattavaAsiakas({
                        ...muokattavaAsiakas,
                        compensation: Number.parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-reference" className="font-medium">
                    Viite
                  </Label>
                  <Input
                    id="edit-reference"
                    value={muokattavaAsiakas.reference || ""}
                    onChange={(e) => setMuokattavaAsiakas({ ...muokattavaAsiakas, reference: e.target.value })}
                    maxLength={255}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-order_index" className="font-medium">
                    Järjestysnumero
                  </Label>
                  <Input
                    id="edit-order_index"
                    type="number"
                    min="0"
                    value={muokattavaAsiakas.order_index || ""}
                    onChange={(e) =>
                      setMuokattavaAsiakas({
                        ...muokattavaAsiakas,
                        order_index: Number.parseInt(e.target.value) || undefined,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-address" className="font-medium">
                  Osoite
                </Label>
                <Input
                  id="edit-address"
                  value={muokattavaAsiakas.address || ""}
                  onChange={(e) => setMuokattavaAsiakas({ ...muokattavaAsiakas, address: e.target.value })}
                  maxLength={255}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-address2" className="font-medium">
                  Osoite 2
                </Label>
                <Input
                  id="edit-address2"
                  value={muokattavaAsiakas.address2 || ""}
                  onChange={(e) => setMuokattavaAsiakas({ ...muokattavaAsiakas, address2: e.target.value })}
                  maxLength={255}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-postal_code" className="font-medium">
                    Postinumero
                  </Label>
                  <Input
                    id="edit-postal_code"
                    value={muokattavaAsiakas.postal_code || ""}
                    onChange={(e) => setMuokattavaAsiakas({ ...muokattavaAsiakas, postal_code: e.target.value })}
                    maxLength={5}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="edit-city" className="font-medium">
                    Kaupunki
                  </Label>
                  <Input
                    id="edit-city"
                    value={muokattavaAsiakas.city || ""}
                    onChange={(e) => setMuokattavaAsiakas({ ...muokattavaAsiakas, city: e.target.value })}
                    maxLength={255}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-email" className="font-medium">
                    Sähköposti
                  </Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={muokattavaAsiakas.email || ""}
                    onChange={(e) => setMuokattavaAsiakas({ ...muokattavaAsiakas, email: e.target.value })}
                    maxLength={255}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone" className="font-medium">
                    Puhelin
                  </Label>
                  <Input
                    id="edit-phone"
                    value={muokattavaAsiakas.phone || ""}
                    onChange={(e) => setMuokattavaAsiakas({ ...muokattavaAsiakas, phone: e.target.value })}
                    maxLength={255}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="edit-show_price_without_tax"
                  checked={muokattavaAsiakas.show_price_without_tax}
                  onCheckedChange={(checked) =>
                    setMuokattavaAsiakas({ ...muokattavaAsiakas, show_price_without_tax: checked as boolean })
                  }
                />
                <Label htmlFor="edit-show_price_without_tax" className="font-medium">
                  Näytä hinnat ilman veroa
                </Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setNaytaMuokkaaDialog(false)}>
              Peruuta
            </Button>
            <Button type="button" onClick={tallennaMuokkaus}>
              <Save className="h-4 w-4 mr-2" />
              Tallenna muutokset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Poistodialogi */}
      <AlertDialog open={!!poistettavaAsiakas} onOpenChange={(open) => !open && setPoistettavaAsiakas(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Haluatko varmasti poistaa tämän asiakkaan?</AlertDialogTitle>
            <AlertDialogDescription>
              Tätä toimintoa ei voi peruuttaa. Asiakkaan tiedot poistetaan pysyvästi järjestelmästä.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Peruuta</AlertDialogCancel>
            <AlertDialogAction onClick={vahvistaPoisto} className="bg-red-500 hover:bg-red-600">
              Poista
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
