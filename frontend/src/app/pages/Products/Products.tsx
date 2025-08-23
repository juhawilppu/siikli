'use client'

import type { GetPackageSettings, GetProductResponseDto } from '@siikli/shared'
import * as Sentry from '@sentry/react'

import { formatNumber } from '@siikli/shared'
import axios from 'axios'
import {
  ChevronDown,
  ChevronUp,
  Edit,
  Plus,
  Trash2,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import SiikliPage from '@/app/components/SiikliPage'
import { useToast } from '@/app/hooks/use-toast'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import NewProduct from './ProductForm'

export default function Products() {
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<GetProductResponseDto[]>([])
  const [packageTypes, setPackageTypes] = useState<string[]>([])
  const [packageSizes, setPackageSizes] = useState<number[]>([])

  const [showNewProductDialog, setShowNewProductDialog] = useState(false)
  const [productIdToDelete, setProductIdToDelete] = useState<string>()
  const [editProductId, setEditProductId] = useState<string>()

  const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>('asc')
  const [orderByField, setOrderByField] = useState<keyof GetProductResponseDto>('name')

  const { toast } = useToast()

  useEffect(() => {
    const loadData = async () => {
      const promises = await Promise.all([
        axios.get<GetProductResponseDto[]>('/products'),
        axios.get<GetPackageSettings>('/tenants/package-settings'),
      ])
      setProducts(promises[0].data)
      setPackageTypes(promises[1].data.packageTypes)
      setPackageSizes(promises[1].data.packageSizes)
      setLoading(false)
    }
    loadData()
  }, [])

  // Filter and sort products
  const filteredTuotteet = products
    .filter((product) => {
      // Search
      const matchesSearch
        = product.name.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesSearch
    })
    .sort((a, b) => {
      // Sorting
      if (typeof a[orderByField] === 'string' && typeof b[orderByField] === 'string') {
        return orderDirection === 'asc'
          ? (a[orderByField] as string).localeCompare(b[orderByField] as string)
          : (b[orderByField] as string).localeCompare(a[orderByField] as string)
      }
      else {
        return orderDirection === 'asc'
          ? (a[orderByField] as number) - (b[orderByField] as number)
          : (b[orderByField] as number) - (a[orderByField] as number)
      }
    })

  const onProductSaved = async (product: GetProductResponseDto) => {
    if (showNewProductDialog) {
      setProducts([...products, product])
      setShowNewProductDialog(false)
      toast({
        title: 'Tuote luotu',
        description: `Tuote "${product.name}" on tallennettu onnistuneesti.`,
        variant: 'success',
      })
    }
    else {
      const newProducts = [...products.filter(p => p.id !== product.id), product]
      setProducts(newProducts)
      setEditProductId(undefined)
      toast({
        title: 'Muutokset tallennettu',
        description: `Tuote "${product.name}" on tallennettu onnistuneesti.`,
        variant: 'success',
      })
    }

    if (product.packageType && !packageTypes.find(t => t === product.packageType)) {
      setPackageTypes([...packageTypes, product.packageType])
    }
    if (product.packageSize && !packageSizes.find(s => s === product.packageSize)) {
      setPackageSizes([...packageSizes, product.packageSize])
    }
  }

  const deleteProduct = async (id: string) => {
    const product = products.find(p => p.id === id)
    if (!product) {
      return
    }

    try {
      await axios.delete(`/products/${id}`)

      const newProductList = products.filter(t => t.id !== id)

      setProducts(newProductList)

      toast({
        title: 'Tuote poistettu',
        description: `Tuote "${product.name}" on poistettu onnistuneesti.`,
      })
    }
    catch (e: any) {
      Sentry.captureException(e)
      toast({
        title: 'Poistaminen epäonnistui',
        description: `Tuotetta "${product.name}" ei voitu poistaa, koska se on jo lisätty tilaukseen.`,
        variant: 'destructive',
      })
    }
  }

  // Change sort order
  const changeSorting = (field: keyof GetProductResponseDto) => {
    if (orderByField === field) {
      setOrderDirection(orderDirection === 'asc' ? 'desc' : 'asc')
    }
    else {
      setOrderByField(field)
      setOrderDirection('asc')
    }
  }

  if (loading || !packageTypes || !packageSizes)
    return <SiikliPage title="Tuotteet" description="Hallitse tuotteita ja hintoja" />

  return (
    <>
      <SiikliPage
        title="Tuotteet"
        description="Hallitse tuotteita ja hintoja"
        mainAction={(
          <Button onClick={() => setShowNewProductDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Lisää tuote
          </Button>
        )}
      >

        <div className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex flex-1 items-center gap-2">
              <Input
                className="h-8 w-full md:w-[300px] bg-white"
                placeholder="Hae tuotetta"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <Dialog open={showNewProductDialog} onOpenChange={setShowNewProductDialog}>

              {showNewProductDialog
                && <NewProduct hide={() => setShowNewProductDialog(false)} onSave={onProductSaved} refPackageSizes={packageSizes} refPackageTypes={packageTypes} />}
            </Dialog>
          </div>

          <Card className="shadow-md">
            <CardHeader className="border-b bg-gray-50 py-4 pl-2">
              <CardTitle>Tuoteluettelo</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="cursor-pointer" onClick={() => changeSorting('name')}>
                      <div className="flex items-center">
                        Nimi
                        {orderByField === 'name'
                          && (orderDirection === 'asc'
                            ? (
                                <ChevronUp className="ml-1 h-4 w-4" />
                              )
                            : (
                                <ChevronDown className="ml-1 h-4 w-4" />
                              ))}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => changeSorting('price')}>
                      <div className="flex items-center">
                        Hinta ALV 0 % (€)
                        {orderByField === 'price'
                          && (orderDirection === 'asc'
                            ? (
                                <ChevronUp className="ml-1 h-4 w-4" />
                              )
                            : (
                                <ChevronDown className="ml-1 h-4 w-4" />
                              ))}
                      </div>
                    </TableHead>
                    <TableHead>Pakkaustiedot</TableHead>
                    <TableHead className="text-right">Toiminnot</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTuotteet.length === 0
                    ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            Ei tuotteita hakuehdoilla
                          </TableCell>
                        </TableRow>
                      )
                    : (
                        filteredTuotteet.map((product, index) => (
                          <TableRow key={product.id} className={index % 2 === 0 ? 'bg-white' : 'bg-white'}>
                            <TableCell className="font-medium">
                              <Button
                                variant="ghost"
                                className="text-blue-500 font-bold"
                                size="default"
                                onClick={() => setEditProductId(product.id)}
                              >
                                {product.name}
                              </Button>
                            </TableCell>
                            <TableCell className="font-medium">{product.price ? `${formatNumber(product.price)} €` : ''}</TableCell>
                            <TableCell>
                              {[product.packageSize ? `${product.packageSize} kg` : '', product.packageType].filter(Boolean).join(', ')}
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
                                        onClick={() => setProductIdToDelete(product.id)}
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
          </Card>
        </div>
      </SiikliPage>
      <Dialog open={editProductId !== undefined} onOpenChange={() => setEditProductId(undefined)}>
        {editProductId
          && <NewProduct productToEdit={products.find(p => p.id === editProductId)} hide={() => setEditProductId(undefined)} onSave={onProductSaved} refPackageTypes={packageTypes} refPackageSizes={packageSizes} />}
      </Dialog>
      {productIdToDelete && (
        <AlertDialog open onOpenChange={() => setProductIdToDelete(undefined)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Poistetaanko tuote?</AlertDialogTitle>
              <AlertDialogDescription>
                <p>⚠️ Tietoja ei voi palauttaa enää jälkikäteen.</p>
                <p className="pt-2">Tuotteen tiedot poistetaan pysyvästi järjestelmästä. Jos tuotetta on käytetty tilauksissa, ne poistetaan myös. Varmista, että olet laskuttanut kaikki tuotteen tilaukset.</p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Peruuta</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteProduct(productIdToDelete)} className="bg-red-500 hover:bg-red-600">
                Poista
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )
}
