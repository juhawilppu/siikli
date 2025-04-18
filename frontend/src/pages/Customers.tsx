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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { CustomerDto, GetCustomersResponseDto } from "@/types/types"
import axios from 'axios'
import {
  Check,
  ChevronDown,
  ChevronsUpDown,
  Edit,
  Filter,
  Plus,
  Save,
  Trash2
} from "lucide-react"
import { useEffect, useState } from 'react'

export const Customers = () => {
  const [customers, setCustomers] = useState<CustomerDto[]>([])
  const [customerGroups, setCustomerGroups] = useState<string[]>([])
  const [chains, setChains] = useState<string[]>([])

  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [customerToEdit, setCustomerToEdit] = useState<CustomerDto>()
  const [customerToCreate, setCustomerToCreate] = useState<Partial<CustomerDto>>({
    chain: "",
    name: "",
    compensation: 0,
    showPriceWithoutTax: false
  })
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [customerIdToDelete, setCustomerIdToDelete] = useState<string | null>(null)
  const [customerGroupFilter, setCustomerGroupFilter] = useState<string>("kaikki")
  const [chainFilter, setChainFilter] = useState<string>("kaikki")
  const [orderDirection, setOrderDirection] = useState<"asc" | "desc">("asc")
  const [jarjestysKentta, setJarjestysKentta] = useState<keyof CustomerDto>("name")
  const [page, setPage] = useState(1)
  const rowsPerPage = 20
  const { toast } = useToast()
  const [inputValueChain, setInputValueChain] = useState("")

  const handleCreateChain = () => {
    if (inputValueChain && !chains.includes(inputValueChain)) {
      console.log("Create chain", inputValueChain)
      setChains([...chains, inputValueChain])
      if (showCreateDialog) {
        setCustomerToCreate({ ...customerToCreate, chain: inputValueChain })
      } else if (showEditDialog) {
        if (customerToEdit) {
          setCustomerToEdit({ ...customerToEdit, chain: inputValueChain })
        }
      }
      setInputValueChain("")
    }
  }

  const handleSelectChain = (chain: string) => {
    setCustomerToCreate({ ...customerToCreate, chain })
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setPage(1) // Reset to first page when searching
  }

  useEffect(() => {
    axios
      .get<GetCustomersResponseDto>('/customers')
      .then((response) => {
        setCustomers(response.data.customers)
        setCustomerGroups(response.data.customerGroups)
        setChains(response.data.chains)
      })
      .finally(() => setLoading(false))
  }, [])

  // Suodata ja järjestä asiakkaat
  const filteredAsiakkaat = customers
    .filter((asiakas) => {
      // Haku
      const matchesSearch =
        asiakas.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asiakas.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asiakas.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asiakas.businessId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asiakas.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asiakas.phone?.toLowerCase().includes(searchQuery.toLowerCase())

      // Asiakasryhmäsuodatus
      const matchesGroup = customerGroupFilter === "kaikki" || asiakas.customerGroup === customerGroupFilter

      // Ketjusuodatus
      const matchesChain = chainFilter === "kaikki" || asiakas.chain === chainFilter

      return matchesSearch && matchesGroup && matchesChain
    })
    .sort((a, b) => {
      // Järjestäminen
      const aValue = a[jarjestysKentta]
      const bValue = b[jarjestysKentta]

      if (aValue === undefined || bValue === undefined) return 0

      if (typeof aValue === "string" && typeof bValue === "string") {
        return orderDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      } else if (typeof aValue === "number" && typeof bValue === "number") {
        return orderDirection === "asc" ? aValue - bValue : bValue - aValue
      } else if (typeof aValue === "boolean" && typeof bValue === "boolean") {
        return orderDirection === "asc" ? (aValue ? 1 : -1) : bValue ? 1 : -1
      }
      return 0
    })

  // Sivutus
  const sivutetutAsiakkaat = filteredAsiakkaat.slice((page - 1) * rowsPerPage, page * rowsPerPage)
  const sivujenMaara = Math.ceil(filteredAsiakkaat.length / rowsPerPage)

  // Asiakkaan muokkaaminen
  const aloitaMuokkaus = (asiakas: CustomerDto) => {
    setCustomerToEdit({ ...asiakas })
    setShowEditDialog(true)
  }

  const tallennaMuokkaus = () => {
    if (!customerToEdit) return

    axios
      .put(`/customers/${customerToEdit.id}`, customerToEdit)
      .then(() => {
        setCustomers(customers.map((a) => (a.id === customerToEdit.id ? customerToEdit : a)))
        setShowEditDialog(false)
        toast({
          title: "Asiakas päivitetty",
          description: `Asiakas "${customerToEdit.name}" on päivitetty onnistuneesti.`,
        })
      })
      .catch((error) => {
        console.error(error)
        toast({
          title: "Virhe",
          description: "Asiakkaan päivitys epäonnistui.",
          variant: "destructive",
        })
      })
  }

  // Uuden asiakkaan lisääminen
  const lisaaAsiakas = () => {
    if (!customerToCreate.name || !customerToCreate.chain) {
      toast({
        title: "Virhe",
        description: "Nimi ja ketju ovat pakollisia tietoja.",
        variant: "destructive",
      })
      return
    }

    const uusiJarjestys = Math.max(...customers.map((a) => a.orderIndex || 0), 0) + 1
    const uusiAsiakasObjekti: CustomerDto = {
      ...customerToCreate,
      orderIndex: uusiJarjestys,
    } as CustomerDto

    axios
      .post('/customers', uusiAsiakasObjekti)
      .then((response) => {
        setCustomers([...customers, response.data])
        setShowCreateDialog(false)
        setCustomerToCreate({
          chain: "",
          name: "",
          compensation: 0,
          showPriceWithoutTax: false
        })
        toast({
          title: "Asiakas lisätty",
          description: `Asiakas "${uusiAsiakasObjekti.name}" on lisätty onnistuneesti.`,
        })
      })
      .catch((error) => {
        console.error(error)
        toast({
          title: "Virhe",
          description: "Asiakkaan lisäys epäonnistui.",
          variant: "destructive",
        })
      })
  }

  // Asiakkaan poistaminen
  const poistaAsiakas = (id: string) => {
    setCustomerIdToDelete(id)
  }

  const vahvistaPoisto = () => {
    if (!customerIdToDelete) return

    const poistettava = customers.find((a) => a.id === customerIdToDelete)
    if (!poistettava) return

    axios
      .delete(`/customers/${customerIdToDelete}`)
      .then(() => {
        setCustomers(customers.filter((a) => a.id !== customerIdToDelete))
        setCustomerIdToDelete(null)
        toast({
          title: "Asiakas poistettu",
          description: `Asiakas "${poistettava.name}" on poistettu onnistuneesti.`,
        })
      })
      .catch((error) => {
        console.error(error)
        toast({
          title: "Virhe",
          description: "Asiakkaan poisto epäonnistui.",
          variant: "destructive",
        })
      })
  }

  // Järjestyksen vaihtaminen
  const vaihdaJarjestys = (kentta: keyof CustomerDto) => {
    if (jarjestysKentta === kentta) {
      setOrderDirection(orderDirection === "asc" ? "desc" : "asc")
    } else {
      setJarjestysKentta(kentta)
      setOrderDirection("asc")
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
            <Input
              type="text"
              placeholder="Hae asiakasta"
              value={searchQuery}
              onChange={handleSearch}
              className="w-full sm:w-auto"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-1">
                  <Filter className="h-4 w-4 mr-1" />
                  Asiakasryhmä: {customerGroupFilter === "kaikki" ? "Kaikki" : customerGroupFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setCustomerGroupFilter("kaikki")}>
                  Kaikki asiakasryhmät
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {customerGroups.map((customerGroup) => (
                  <DropdownMenuItem key={customerGroup} onClick={() => setCustomerGroupFilter(customerGroup)}>
                    {customerGroup}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-1">
                  <Filter className="h-4 w-4 mr-1" />
                  Ketju: {chainFilter === "kaikki" ? "Kaikki" : chainFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setChainFilter("kaikki")}>Kaikki ketjut</DropdownMenuItem>
                <DropdownMenuSeparator />
                {chains.map((chain) => (
                  <DropdownMenuItem key={chain} onClick={() => setChainFilter(chain)}>
                    {chain}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
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
                      value={customerToCreate.name || ""}
                      onChange={(e) => setCustomerToCreate({ ...customerToCreate, name: e.target.value })}
                      maxLength={50}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="chain" className="font-medium">
                      Ketju *
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" className="w-full justify-between">
                          {customerToCreate.chain || "Valitse ketju"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <div className="p-2">
                          <Input
                            placeholder="Hae tai lisää"
                            value={inputValueChain}
                            onChange={(e) => setInputValueChain(e.target.value)}
                            className="mb-2"
                          />
                          {inputValueChain && !chains.includes(inputValueChain) && (
                            <Button
                              variant="ghost"
                              className="w-full justify-start"
                              onClick={handleCreateChain}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Luo: {inputValueChain}
                            </Button>
                          )}
                        </div>
                        <div className="max-h-[200px] overflow-y-auto">
                          {chains.map((chain) => (
                            <Button
                              key={chain}
                              variant="ghost"
                              className="w-full justify-start"
                              onClick={() => handleSelectChain(chain)}
                            >
                              <Check className={cn("mr-2 h-4 w-4", customerToCreate.chain === chain ? "opacity-100" : "opacity-0")} />
                              {chain}
                            </Button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company_name" className="font-medium">
                      Yrityksen nimi
                    </Label>
                    <Input
                      id="company_name"
                      value={customerToCreate.companyName || ""}
                      onChange={(e) => setCustomerToCreate({ ...customerToCreate, companyName: e.target.value })}
                      maxLength={255}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="business_id" className="font-medium">
                      Y-tunnus
                    </Label>
                    <Input
                      id="business_id"
                      value={customerToCreate.businessId || ""}
                      onChange={(e) => setCustomerToCreate({ ...customerToCreate, businessId: e.target.value })}
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
                      value={customerToCreate.customerGroup ?? undefined}
                      onValueChange={(value) => setCustomerToCreate({ ...customerToCreate, customerGroup: value })}
                    >
                      <SelectTrigger id="customer_group">
                        <SelectValue placeholder="Valitse asiakasryhmä" />
                      </SelectTrigger>
                      <SelectContent>
                        {customerGroups.map((customerGroup) => (
                          <SelectItem key={customerGroup} value={customerGroup}>
                            {customerGroup}
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
                      value={customerToCreate.compensation || ""}
                      onChange={(e) =>
                        setCustomerToCreate({
                          ...customerToCreate,
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
                      value={customerToCreate.reference || ""}
                      onChange={(e) => setCustomerToCreate({ ...customerToCreate, reference: e.target.value })}
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
                      value={customerToCreate.orderIndex || ""}
                      onChange={(e) =>
                        setCustomerToCreate({
                          ...customerToCreate,
                          orderIndex: Number.parseInt(e.target.value) || undefined,
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
                    value={customerToCreate.streetAddress || ""}
                    onChange={(e) => setCustomerToCreate({ ...customerToCreate, streetAddress: e.target.value })}
                    maxLength={255}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address2" className="font-medium">
                    Osoite 2
                  </Label>
                  <Input
                    id="address2"
                    value={customerToCreate.streetAddress2 || ""}
                    onChange={(e) => setCustomerToCreate({ ...customerToCreate, streetAddress2: e.target.value })}
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
                      value={customerToCreate.postalCode || ""}
                      onChange={(e) => setCustomerToCreate({ ...customerToCreate, postalCode: e.target.value })}
                      maxLength={5}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="city" className="font-medium">
                      Kaupunki
                    </Label>
                    <Input
                      id="city"
                      value={customerToCreate.city || ""}
                      onChange={(e) => setCustomerToCreate({ ...customerToCreate, city: e.target.value })}
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
                      value={customerToCreate.email || ""}
                      onChange={(e) => setCustomerToCreate({ ...customerToCreate, email: e.target.value })}
                      maxLength={255}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="font-medium">
                      Puhelin
                    </Label>
                    <Input
                      id="phone"
                      value={customerToCreate.phone || ""}
                      onChange={(e) => setCustomerToCreate({ ...customerToCreate, phone: e.target.value })}
                      maxLength={255}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id="show_price_without_tax"
                    checked={customerToCreate.showPriceWithoutTax}
                    onCheckedChange={(checked) =>
                      setCustomerToCreate({ ...customerToCreate, showPriceWithoutTax: checked as boolean })
                    }
                  />
                  <Label htmlFor="show_price_without_tax" className="font-medium">
                    Näytä hinnat ilman veroa
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
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
                          className={`ml-1 h-4 w-4 ${orderDirection === "asc" ? "rotate-180 transform" : ""}`}
                        />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Yritys</TableHead>
                  <TableHead>Kaupunki</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => vaihdaJarjestys("customerGroup")}>
                    <div className="flex items-center">
                      Asiakasryhmä
                      {jarjestysKentta === "customerGroup" && (
                        <ChevronDown
                          className={`ml-1 h-4 w-4 ${orderDirection === "asc" ? "rotate-180 transform" : ""}`}
                        />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => vaihdaJarjestys("compensation")}>
                    <div className="flex items-center">
                      Korvaus
                      {jarjestysKentta === "compensation" && (
                        <ChevronDown
                          className={`ml-1 h-4 w-4 ${orderDirection === "asc" ? "rotate-180 transform" : ""}`}
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
                      <TableCell>{asiakas.companyName}</TableCell>
                      <TableCell>{asiakas.city}</TableCell>
                      <TableCell>{asiakas.customerGroup}</TableCell>
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
              Näytetään {(page - 1) * rowsPerPage + 1}-
              {Math.min(page * rowsPerPage, filteredAsiakkaat.length)} / {filteredAsiakkaat.length} asiakasta
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    className={page === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(5, sivujenMaara) }, (_, i) => {
                  let pageNum = i + 1
                  if (sivujenMaara > 5 && page > 3) {
                    pageNum = page - 3 + i
                    if (pageNum > sivujenMaara) {
                      pageNum = sivujenMaara - (4 - i)
                    }
                  }
                  return (
                    <PaginationItem key={i}>
                      <PaginationLink
                        onClick={() => setPage(pageNum)}
                        isActive={page === pageNum}
                        className={pageNum > sivujenMaara ? "pointer-events-none opacity-50" : ""}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  )
                })}
                {sivujenMaara > 5 && page < sivujenMaara - 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPage((prev) => Math.min(prev + 1, sivujenMaara))}
                    className={page === sivujenMaara || sivujenMaara === 0 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardFooter>
        </Card>
      </div>

      {/* Muokkausdialogi */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Muokkaa asiakasta</DialogTitle>
            <DialogDescription>
              Muokkaa asiakkaan tietoja. Pakolliset kentät on merkitty tähdellä (*).
            </DialogDescription>
          </DialogHeader>
          {customerToEdit && (
            <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name" className="font-medium">
                    Nimi *
                  </Label>
                  <Input
                    id="edit-name"
                    value={customerToEdit.name}
                    onChange={(e) => setCustomerToEdit({ ...customerToEdit, name: e.target.value })}
                    maxLength={50}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-chain" className="font-medium">
                    Ketju *
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" className="w-full justify-between">
                        {customerToEdit.chain || "Valitse ketju"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <div className="p-2">
                        <Input
                          placeholder="Hae tai lisää"
                          value={inputValueChain}
                          onChange={(e) => setInputValueChain(e.target.value)}
                          className="mb-2"
                        />
                        {inputValueChain && !chains.includes(inputValueChain) && (
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={handleCreateChain}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Luo: {inputValueChain}
                          </Button>
                        )}
                      </div>
                      <div className="max-h-[200px] overflow-y-auto">
                        {chains.map((chain) => (
                          <Button
                            key={chain}
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => setCustomerToEdit({ ...customerToEdit, chain })}
                          >
                            <Check className={cn("mr-2 h-4 w-4", customerToEdit.chain === chain ? "opacity-100" : "opacity-0")} />
                            {chain}
                          </Button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-company_name" className="font-medium">
                    Yrityksen nimi
                  </Label>
                  <Input
                    id="edit-company_name"
                    value={customerToEdit.companyName || ""}
                    onChange={(e) => setCustomerToEdit({ ...customerToEdit, companyName: e.target.value })}
                    maxLength={255}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-business_id" className="font-medium">
                    Y-tunnus
                  </Label>
                  <Input
                    id="edit-business_id"
                    value={customerToEdit.businessId || ""}
                    onChange={(e) => setCustomerToEdit({ ...customerToEdit, businessId: e.target.value })}
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
                    value={customerToEdit.customerGroup || ""}
                    onValueChange={(value) => setCustomerToEdit({ ...customerToEdit, customerGroup: value })}
                  >
                    <SelectTrigger id="edit-customer_group">
                      <SelectValue placeholder="Valitse asiakasryhmä" />
                    </SelectTrigger>
                    <SelectContent>
                      {customerGroups.map((customerGroup) => (
                        <SelectItem key={customerGroup} value={customerGroup}>
                          {customerGroup}
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
                    value={customerToEdit.compensation}
                    onChange={(e) =>
                      setCustomerToEdit({
                        ...customerToEdit,
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
                    value={customerToEdit.reference || ""}
                    onChange={(e) => setCustomerToEdit({ ...customerToEdit, reference: e.target.value })}
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
                    value={customerToEdit.orderIndex || ""}
                    onChange={(e) =>
                      setCustomerToEdit({
                        ...customerToEdit,
                        orderIndex: Number.parseInt(e.target.value) || 0,
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
                  value={customerToEdit.streetAddress || ""}
                  onChange={(e) => setCustomerToEdit({ ...customerToEdit, streetAddress: e.target.value })}
                  maxLength={255}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-address2" className="font-medium">
                  Osoite 2
                </Label>
                <Input
                  id="edit-address2"
                  value={customerToEdit.streetAddress2 || ""}
                  onChange={(e) => setCustomerToEdit({ ...customerToEdit, streetAddress2: e.target.value })}
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
                    value={customerToEdit.postalCode || ""}
                    onChange={(e) => setCustomerToEdit({ ...customerToEdit, postalCode: e.target.value })}
                    maxLength={5}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="edit-city" className="font-medium">
                    Kaupunki
                  </Label>
                  <Input
                    id="edit-city"
                    value={customerToEdit.city || ""}
                    onChange={(e) => setCustomerToEdit({ ...customerToEdit, city: e.target.value })}
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
                    value={customerToEdit.email || ""}
                    onChange={(e) => setCustomerToEdit({ ...customerToEdit, email: e.target.value })}
                    maxLength={255}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone" className="font-medium">
                    Puhelin
                  </Label>
                  <Input
                    id="edit-phone"
                    value={customerToEdit.phone || ""}
                    onChange={(e) => setCustomerToEdit({ ...customerToEdit, phone: e.target.value })}
                    maxLength={255}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="edit-show_price_without_tax"
                  checked={customerToEdit.showPriceWithoutTax}
                  onCheckedChange={(checked) =>
                    setCustomerToEdit({ ...customerToEdit, showPriceWithoutTax: checked as boolean })
                  }
                />
                <Label htmlFor="edit-show_price_without_tax" className="font-medium">
                  Näytä hinnat ilman veroa
                </Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
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
      <AlertDialog open={!!customerIdToDelete} onOpenChange={(open) => !open && setCustomerIdToDelete(null)}>
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
