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


// Tuoteryhmät
const tuoteryhmat = ["Viljat", "Siemenet", "Jauhot", "Hiutaleet", "Luomutuotteet"]

// Alituoteryhmät
const alituoteryhmat = {
  Viljat: ["Vehnä", "Ohra", "Kaura", "Ruis"],
  Siemenet: ["Perunansiemen", "Ohransiemen", "Kauransiemen"],
  Jauhot: ["Vehnäjauho", "Ruisjauho", "Ohrajauho"],
  Hiutaleet: ["Kaurahiutale", "Ruishiutale", "Vehnähiutale"],
  Luomutuotteet: ["Luomuvehnä", "Luomukaura", "Luomuruis"],
}

// Pakkausvaihtoehdot
const pakkausvaihtoehdot = ["S", "A", "Ltk"]

// Esimerkkituotteet
const exampleProducts = [
  {
    id: "1",
    jarjestysnumero: 1,
    nimi: "Luomu Vehnäjauho",
    lajike: "Kruunu",
    tuoteryhma: "Jauhot",
    alituoteryhma: "Vehnäjauho",
    oletushinta: 3.5,
    oletuspakkauskoko: 25,
    oletuspakkaus: "S",
    hinta: 3.5,
    hintaAlv0: 2.82,
  },
  {
    id: "2",
    jarjestysnumero: 2,
    nimi: "Ohransiemen",
    lajike: "Kunnari",
    tuoteryhma: "Siemenet",
    alituoteryhma: "Ohransiemen",
    oletushinta: 5.75,
    oletuspakkauskoko: 20,
    oletuspakkaus: "A",
    hinta: 5.75,
    hintaAlv0: 4.64,
  },
  {
    id: "3",
    jarjestysnumero: 3,
    nimi: "Kaurahiutale",
    lajike: "Aslak",
    tuoteryhma: "Hiutaleet",
    alituoteryhma: "Kaurahiutale",
    oletushinta: 2.8,
    oletuspakkauskoko: 10,
    oletuspakkaus: "Ltk",
    hinta: 2.8,
    hintaAlv0: 2.26,
  },
  {
    id: "4",
    jarjestysnumero: 4,
    nimi: "Ruisjauho",
    lajike: "Reetta",
    tuoteryhma: "Jauhot",
    alituoteryhma: "Ruisjauho",
    oletushinta: 4.2,
    oletuspakkauskoko: 15,
    oletuspakkaus: "S",
    hinta: 4.2,
    hintaAlv0: 3.39,
  },
  {
    id: "5",
    jarjestysnumero: 5,
    nimi: "Perunansiemen",
    lajike: "Siikli",
    tuoteryhma: "Siemenet",
    alituoteryhma: "Perunansiemen",
    oletushinta: 6.5,
    oletuspakkauskoko: 30,
    oletuspakkaus: "A",
    hinta: 6.5,
    hintaAlv0: 5.24,
  },
  {
    id: "6",
    jarjestysnumero: 6,
    nimi: "Luomu Kaurahiutale",
    lajike: "Niklas",
    tuoteryhma: "Luomutuotteet",
    alituoteryhma: "Luomukaura",
    oletushinta: 3.95,
    oletuspakkauskoko: 12,
    oletuspakkaus: "Ltk",
    hinta: 3.95,
    hintaAlv0: 3.19,
  },
  {
    id: "7",
    jarjestysnumero: 7,
    nimi: "Vehnä",
    lajike: "Anniina",
    tuoteryhma: "Viljat",
    alituoteryhma: "Vehnä",
    oletushinta: 2.4,
    oletuspakkauskoko: 40,
    oletuspakkaus: "S",
    hinta: 2.4,
    hintaAlv0: 1.94,
  },
]

interface Tuote {
  id: string
  jarjestysnumero: number
  nimi: string
  lajike: string
  tuoteryhma: string
  alituoteryhma: string
  oletushinta: number
  oletuspakkauskoko: number
  oletuspakkaus: string
  hinta: number
  hintaAlv0: number
}

export default function TuotteetSivu() {
  const [searchQuery, setSearchQuery] = useState("")
  const [products, setProducts] = useState<Tuote[]>(exampleProducts)
  const [muokattavaTuote, setMuokattavaTuote] = useState<Tuote | null>(null)
  const [uusiTuote, setUusiTuote] = useState<Partial<Tuote>>({
    jarjestysnumero: products.length + 1,
    nimi: "",
    lajike: "",
    tuoteryhma: "",
    alituoteryhma: "",
    oletushinta: 0,
    oletuspakkauskoko: 0,
    oletuspakkaus: "",
    hinta: 0,
    hintaAlv0: 0,
  })
  const [naytaLisaaDialog, setNaytaLisaaDialog] = useState(false)
  const [naytaMuokkaaDialog, setNaytaMuokkaaDialog] = useState(false)
  const [tuoteryhmaFilter, setTuoteryhmaFilter] = useState<string>("kaikki")
  const [jarjestys, setJarjestys] = useState<"asc" | "desc">("asc")
  const [jarjestysKentta, setJarjestysKentta] = useState<keyof Tuote>("jarjestysnumero")

  const { toast } = useToast()

  // Alituoteryhmät valitun tuoteryhmän perusteella
  const [valittavatAlituoteryhmat, setValittavatAlituoteryhmat] = useState<string[]>([])

  useEffect(() => {
    if (muokattavaTuote?.tuoteryhma) {
      setValittavatAlituoteryhmat(alituoteryhmat[muokattavaTuote.tuoteryhma as keyof typeof alituoteryhmat] || [])
    } else if (uusiTuote.tuoteryhma) {
      setValittavatAlituoteryhmat(alituoteryhmat[uusiTuote.tuoteryhma as keyof typeof alituoteryhmat] || [])
    } else {
      setValittavatAlituoteryhmat([])
    }
  }, [muokattavaTuote?.tuoteryhma, uusiTuote.tuoteryhma])

  // Suodata ja järjestä tuotteet
  const filteredTuotteet = products
    .filter((tuote) => {
      // Haku
      const matchesSearch =
        tuote.nimi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tuote.lajike.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tuote.tuoteryhma.toLowerCase().includes(searchQuery.toLowerCase())

      // Tuoteryhmäsuodatus
      const matchesCategory = tuoteryhmaFilter === "kaikki" || tuote.tuoteryhma === tuoteryhmaFilter

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
  const muutaJarjestysnumeroa = (id: string, suunta: "up" | "down") => {
    const tuoteIndex = products.findIndex((t) => t.id === id)
    if (tuoteIndex === -1) return

    const vaihdettavaIndex = suunta === "up" ? tuoteIndex - 1 : tuoteIndex + 1

    // Tarkista, että vaihdettava indeksi on sallitulla alueella
    if (vaihdettavaIndex < 0 || vaihdettavaIndex >= products.length) return

    const paivitetytTuotteet = [...products]

    // Vaihda järjestysnumerot
    const temp = paivitetytTuotteet[tuoteIndex].jarjestysnumero
    paivitetytTuotteet[tuoteIndex].jarjestysnumero = paivitetytTuotteet[vaihdettavaIndex].jarjestysnumero
    paivitetytTuotteet[vaihdettavaIndex].jarjestysnumero = temp

    // Järjestä tuotteet uudelleen järjestysnumeron mukaan
    paivitetytTuotteet.sort((a, b) => a.jarjestysnumero - b.jarjestysnumero)

    setProducts(paivitetytTuotteet)

    toast({
      title: "Järjestys päivitetty",
      description: `Tuotteen "${products[tuoteIndex].nimi}" järjestys muutettu.`,
    })
  }

  // Tuotteen muokkaaminen
  const aloitaMuokkaus = (tuote: Tuote) => {
    setMuokattavaTuote({ ...tuote })
    setNaytaMuokkaaDialog(true)
  }

  const tallennaMuokkaus = () => {
    if (!muokattavaTuote) return

    // Laske ALV 0% hinta (24% ALV)
    const hintaAlv0 = Number((muokattavaTuote.hinta / 1.24).toFixed(2))

    const paivitetytTuotteet = products.map((t) =>
      t.id === muokattavaTuote.id ? { ...muokattavaTuote, hintaAlv0 } : t,
    )

    setProducts(paivitetytTuotteet)
    setNaytaMuokkaaDialog(false)

    toast({
      title: "Tuote päivitetty",
      description: `Tuote "${muokattavaTuote.nimi}" on päivitetty onnistuneesti.`,
    })
  }

  // Uuden tuotteen lisääminen
  const lisaaTuote = () => {
    if (!uusiTuote.nimi || !uusiTuote.tuoteryhma) {
      toast({
        title: "Virhe",
        description: "Nimi ja tuoteryhmä ovat pakollisia tietoja.",
        variant: "destructive",
      })
      return
    }

    // Laske ALV 0% hinta (24% ALV)
    const hintaAlv0 = Number(((uusiTuote.hinta || 0) / 1.24).toFixed(2))

    const uusiId = (Number.parseInt(products[products.length - 1]?.id || "0") + 1).toString()

    const uusiTuoteObjekti: Tuote = {
      id: uusiId,
      jarjestysnumero: products.length + 1,
      nimi: uusiTuote.nimi || "",
      lajike: uusiTuote.lajike || "",
      tuoteryhma: uusiTuote.tuoteryhma || "",
      alituoteryhma: uusiTuote.alituoteryhma || "",
      oletushinta: uusiTuote.oletushinta || 0,
      oletuspakkauskoko: uusiTuote.oletuspakkauskoko || 0,
      oletuspakkaus: uusiTuote.oletuspakkaus || "",
      hinta: uusiTuote.hinta || 0,
      hintaAlv0: hintaAlv0,
    }

    setProducts([...products, uusiTuoteObjekti])

    // Tyhjennä lomake
    setUusiTuote({
      jarjestysnumero: products.length + 2,
      nimi: "",
      lajike: "",
      tuoteryhma: "",
      alituoteryhma: "",
      oletushinta: 0,
      oletuspakkauskoko: 0,
      oletuspakkaus: "",
      hinta: 0,
      hintaAlv0: 0,
    })

    setNaytaLisaaDialog(false)

    toast({
      title: "Tuote lisätty",
      description: `Tuote "${uusiTuoteObjekti.nimi}" on lisätty onnistuneesti.`,
    })
  }

  // Tuotteen poistaminen
  const poistaTuote = (id: string) => {
    const poistettavaTuote = products.find((t) => t.id === id)
    if (!poistettavaTuote) return

    const paivitetytTuotteet = products.filter((t) => t.id !== id)

    // Päivitä järjestysnumerot
    const jarjestetytTuotteet = paivitetytTuotteet.map((tuote, index) => ({
      ...tuote,
      jarjestysnumero: index + 1,
    }))

    setProducts(jarjestetytTuotteet)

    toast({
      title: "Tuote poistettu",
      description: `Tuote "${poistettavaTuote.nimi}" on poistettu onnistuneesti.`,
    })
  }

  // Järjestyksen vaihtaminen
  const vaihdaJarjestys = (kentta: keyof Tuote) => {
    if (jarjestysKentta === kentta) {
      setJarjestys(jarjestys === "asc" ? "desc" : "asc")
    } else {
      setJarjestysKentta(kentta)
      setJarjestys("asc")
    }
  }

  // Tuoteryhmän vaihtaminen (muokkaustilassa)
  const handleTuoteryhmaChange = (value: string) => {
    if (muokattavaTuote) {
      setMuokattavaTuote({
        ...muokattavaTuote,
        tuoteryhma: value,
        alituoteryhma: "", // Tyhjennä alituoteryhmä, koska se riippuu tuoteryhmästä
      })
    } else {
      setUusiTuote({
        ...uusiTuote,
        tuoteryhma: value,
        alituoteryhma: "", // Tyhjennä alituoteryhmä, koska se riippuu tuoteryhmästä
      })
    }
  }

  return (
    <>
      <main className="flex-1 overflow-auto p-6">
        <div className="space-y-6 max-w-7xl mx-auto">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Tuotteet</h1>
            <p className="text-gray-600 mt-1">Hallitse tuotteita, hintoja ja tuotetietoja</p>
          </div>

          {/* Toiminnot ja suodattimet */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex flex-wrap gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-1">
                    <Filter className="h-4 w-4 mr-1" />
                    Tuoteryhmä: {tuoteryhmaFilter === "kaikki" ? "Kaikki" : tuoteryhmaFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setTuoteryhmaFilter("kaikki")}>
                    Kaikki tuoteryhmät
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {tuoteryhmat.map((ryhma) => (
                    <DropdownMenuItem key={ryhma} onClick={() => setTuoteryhmaFilter(ryhma)}>
                      {ryhma}
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
                      <Label htmlFor="nimi" className="font-medium">
                        Nimi *
                      </Label>
                      <Input
                        id="nimi"
                        value={uusiTuote.nimi || ""}
                        onChange={(e) => setUusiTuote({ ...uusiTuote, nimi: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lajike" className="font-medium">
                        Lajike
                      </Label>
                      <Input
                        id="lajike"
                        value={uusiTuote.lajike || ""}
                        onChange={(e) => setUusiTuote({ ...uusiTuote, lajike: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tuoteryhma" className="font-medium">
                        Tuoteryhmä *
                      </Label>
                      <Select value={uusiTuote.tuoteryhma} onValueChange={handleTuoteryhmaChange}>
                        <SelectTrigger id="tuoteryhma">
                          <SelectValue placeholder="Valitse tuoteryhmä" />
                        </SelectTrigger>
                        <SelectContent>
                          {tuoteryhmat.map((ryhma) => (
                            <SelectItem key={ryhma} value={ryhma}>
                              {ryhma}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="alituoteryhma" className="font-medium">
                        Alituoteryhmä
                      </Label>
                      <Select
                        value={uusiTuote.alituoteryhma}
                        onValueChange={(value) => setUusiTuote({ ...uusiTuote, alituoteryhma: value })}
                        disabled={!uusiTuote.tuoteryhma}
                      >
                        <SelectTrigger id="alituoteryhma">
                          <SelectValue placeholder="Valitse alituoteryhmä" />
                        </SelectTrigger>
                        <SelectContent>
                          {valittavatAlituoteryhmat.map((aliryhma) => (
                            <SelectItem key={aliryhma} value={aliryhma}>
                              {aliryhma}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="oletushinta" className="font-medium">
                        Oletushinta (€)
                      </Label>
                      <Input
                        id="oletushinta"
                        type="number"
                        step="0.01"
                        min="0"
                        value={uusiTuote.oletushinta || ""}
                        onChange={(e) =>
                          setUusiTuote({ ...uusiTuote, oletushinta: Number.parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="oletuspakkauskoko" className="font-medium">
                        Oletuspakkauskoko (kg)
                      </Label>
                      <Input
                        id="oletuspakkauskoko"
                        type="number"
                        step="0.01"
                        min="0"
                        value={uusiTuote.oletuspakkauskoko || ""}
                        onChange={(e) =>
                          setUusiTuote({
                            ...uusiTuote,
                            oletuspakkauskoko: Number.parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="oletuspakkaus" className="font-medium">
                        Oletuspakkaus
                      </Label>
                      <Select
                        value={uusiTuote.oletuspakkaus}
                        onValueChange={(value) => setUusiTuote({ ...uusiTuote, oletuspakkaus: value })}
                      >
                        <SelectTrigger id="oletuspakkaus">
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
                      <Label htmlFor="hinta" className="font-medium">
                        Hinta (€)
                      </Label>
                      <Input
                        id="hinta"
                        type="number"
                        step="0.01"
                        min="0"
                        value={uusiTuote.hinta || ""}
                        onChange={(e) =>
                          setUusiTuote({ ...uusiTuote, hinta: Number.parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hintaAlv0" className="font-medium">
                        Hinta ALV 0% (€)
                      </Label>
                      <Input
                        id="hintaAlv0"
                        type="number"
                        step="0.01"
                        min="0"
                        value={uusiTuote.hinta ? (uusiTuote.hinta / 1.24).toFixed(2) : ""}
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
                  <Button type="button" onClick={lisaaTuote}>
                    <Save className="h-4 w-4 mr-2" />
                    Tallenna
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Tuotetaulukko */}
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
                    <TableHead className="cursor-pointer" onClick={() => vaihdaJarjestys("nimi")}>
                      <div className="flex items-center">
                        Nimi
                        {jarjestysKentta === "nimi" &&
                          (jarjestys === "asc" ? (
                            <ChevronUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ChevronDown className="ml-1 h-4 w-4" />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead>Lajike</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => vaihdaJarjestys("tuoteryhma")}>
                      <div className="flex items-center">
                        Tuoteryhmä
                        {jarjestysKentta === "tuoteryhma" &&
                          (jarjestys === "asc" ? (
                            <ChevronUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ChevronDown className="ml-1 h-4 w-4" />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead>Alituoteryhmä</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => vaihdaJarjestys("hinta")}>
                      <div className="flex items-center">
                        Hinta (€)
                        {jarjestysKentta === "hinta" &&
                          (jarjestys === "asc" ? (
                            <ChevronUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ChevronDown className="ml-1 h-4 w-4" />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead>Hinta ALV 0% (€)</TableHead>
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
                    filteredTuotteet.map((tuote, index) => (
                      <TableRow key={tuote.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <TableCell>
                          <div className="flex items-center">
                            <span className="font-medium mr-2">{tuote.jarjestysnumero}</span>
                            <div className="flex flex-col">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => muutaJarjestysnumeroa(tuote.id, "up")}
                                      disabled={tuote.jarjestysnumero === 1}
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
                                      onClick={() => muutaJarjestysnumeroa(tuote.id, "down")}
                                      disabled={tuote.jarjestysnumero === products.length}
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
                        <TableCell className="font-medium">{tuote.nimi}</TableCell>
                        <TableCell>{tuote.lajike}</TableCell>
                        <TableCell>{tuote.tuoteryhma}</TableCell>
                        <TableCell>{tuote.alituoteryhma}</TableCell>
                        <TableCell className="font-medium">{tuote.hinta.toFixed(2)}</TableCell>
                        <TableCell>{tuote.hintaAlv0.toFixed(2)}</TableCell>
                        <TableCell>{tuote.oletuspakkauskoko} kg</TableCell>
                        <TableCell>{tuote.oletuspakkaus}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => aloitaMuokkaus(tuote)}
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
                                    onClick={() => poistaTuote(tuote.id)}
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
          {muokattavaTuote && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-nimi" className="font-medium">
                    Nimi *
                  </Label>
                  <Input
                    id="edit-nimi"
                    value={muokattavaTuote.nimi}
                    onChange={(e) => setMuokattavaTuote({ ...muokattavaTuote, nimi: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-lajike" className="font-medium">
                    Lajike
                  </Label>
                  <Input
                    id="edit-lajike"
                    value={muokattavaTuote.lajike}
                    onChange={(e) => setMuokattavaTuote({ ...muokattavaTuote, lajike: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-tuoteryhma" className="font-medium">
                    Tuoteryhmä *
                  </Label>
                  <Select value={muokattavaTuote.tuoteryhma} onValueChange={handleTuoteryhmaChange}>
                    <SelectTrigger id="edit-tuoteryhma">
                      <SelectValue placeholder="Valitse tuoteryhmä" />
                    </SelectTrigger>
                    <SelectContent>
                      {tuoteryhmat.map((ryhma) => (
                        <SelectItem key={ryhma} value={ryhma}>
                          {ryhma}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-alituoteryhma" className="font-medium">
                    Alituoteryhmä
                  </Label>
                  <Select
                    value={muokattavaTuote.alituoteryhma}
                    onValueChange={(value) => setMuokattavaTuote({ ...muokattavaTuote, alituoteryhma: value })}
                  >
                    <SelectTrigger id="edit-alituoteryhma">
                      <SelectValue placeholder="Valitse alituoteryhmä" />
                    </SelectTrigger>
                    <SelectContent>
                      {valittavatAlituoteryhmat.map((aliryhma) => (
                        <SelectItem key={aliryhma} value={aliryhma}>
                          {aliryhma}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-oletushinta" className="font-medium">
                    Oletushinta (€)
                  </Label>
                  <Input
                    id="edit-oletushinta"
                    type="number"
                    step="0.01"
                    min="0"
                    value={muokattavaTuote.oletushinta}
                    onChange={(e) =>
                      setMuokattavaTuote({ ...muokattavaTuote, oletushinta: Number.parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-oletuspakkauskoko" className="font-medium">
                    Oletuspakkauskoko (kg)
                  </Label>
                  <Input
                    id="edit-oletuspakkauskoko"
                    type="number"
                    step="0.01"
                    min="0"
                    value={muokattavaTuote.oletuspakkauskoko}
                    onChange={(e) =>
                      setMuokattavaTuote({
                        ...muokattavaTuote,
                        oletuspakkauskoko: Number.parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-oletuspakkaus" className="font-medium">
                    Oletuspakkaus
                  </Label>
                  <Select
                    value={muokattavaTuote.oletuspakkaus}
                    onValueChange={(value) => setMuokattavaTuote({ ...muokattavaTuote, oletuspakkaus: value })}
                  >
                    <SelectTrigger id="edit-oletuspakkaus">
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
                  <Label htmlFor="edit-hinta" className="font-medium">
                    Hinta (€)
                  </Label>
                  <Input
                    id="edit-hinta"
                    type="number"
                    step="0.01"
                    min="0"
                    value={muokattavaTuote.hinta}
                    onChange={(e) =>
                      setMuokattavaTuote({ ...muokattavaTuote, hinta: Number.parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-hintaAlv0" className="font-medium">
                    Hinta ALV 0% (€)
                  </Label>
                  <Input
                    id="edit-hintaAlv0"
                    type="number"
                    step="0.01"
                    min="0"
                    value={(muokattavaTuote.hinta / 1.24).toFixed(2)}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-muted-foreground">Lasketaan automaattisesti (ALV 24%)</p>
                </div>
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
    </>
  )
}
