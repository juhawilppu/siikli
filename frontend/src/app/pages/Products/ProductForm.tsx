'use client'

import type { GetProductResponseDto, PostProductCreateRequestDto } from '@siikli/shared'

import { Popover } from '@radix-ui/react-popover'
import { formatNumber } from '@siikli/shared'
import axios from 'axios'
import {
  Check,
  ChevronsUpDown,
  Euro,
  Package,
  Plus,
  Save,
} from 'lucide-react'
import { useState } from 'react'
import { useIsMobile } from '@/app/hooks/use-mobile'
import { toast } from '@/app/hooks/use-toast.js'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { serializeNumber } from '@/utils/serialization'

export default function NewProduct({ productToEdit, hide, onSave, refPackageTypes, refPackageSizes }: { productToEdit?: GetProductResponseDto, hide: () => void, onSave: (product: GetProductResponseDto) => void, refPackageTypes: string[], refPackageSizes: number[] }) {
  const mode = productToEdit ? 'edit' : 'create'
  const isMobile = useIsMobile()
  const [product, setProduct] = useState<Partial<{
    name: string
    type: string
    subtype: string
    price: string
    packageSize: number
    packageType: string
    variety: string
    info: string
    id: string
  }>>(mode === 'edit'
    ? {
        ...productToEdit,
        price: productToEdit?.price ? formatNumber(productToEdit.price) : '',
        packageSize: productToEdit?.packageSize || undefined,
        packageType: productToEdit?.packageType || '',
        id: productToEdit?.id || '',
      }
    : {
        price: '',
        packageSize: undefined,
        packageType: '',
        id: '',
      })

  const [openPackageSize, setOpenPackageSize] = useState(false)
  const [inputValuePackageSize, setInputValuePackageSize] = useState('')

  const [openPackageType, setOpenPackageType] = useState(false)
  const [inputValuePackageType, setInputValuePackageType] = useState('')

  const [packageSizes, setPackageSizes] = useState<number[]>([...refPackageSizes])
  const [packageTypes, setPackageTypes] = useState<string[]>([...refPackageTypes])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!product.name) {
      toast({
        title: 'Virhe',
        description: 'Nimi on pakollinen tieto.',
        variant: 'destructive',
      })
      return
    }

    const data: PostProductCreateRequestDto = {
      name: product.name,
      price: product.price ? serializeNumber(product.price) : undefined,
      packageSize: product.packageSize || undefined,
      packageType: product.packageType || '',
    }

    if (mode === 'edit') {
      await axios.put(`/products/${product.id}`, data)
      onSave({ ...product, id: product.id as string, name: product.name as string, packageSize: product.packageSize || null, packageType: product.packageType || null, price: product.price ? serializeNumber(product.price) : undefined } satisfies GetProductResponseDto)
    }
    else {
      const res = await axios.post<{ id: string }>('/products', data)

      onSave({ ...product, id: res.data.id, price: product.price } as GetProductResponseDto)
    }
  }

  return (
    <DialogContent className="sm:max-w-[500px] w-full h-full sm:h-auto overflow-y-auto">
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">{mode === 'create' ? 'Uusi tuote' : 'Muokkaa tuotetta'}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base font-medium">
              Nimi
              {' '}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              className="w-full"
              value={product?.name || ''}
              onChange={e => setProduct({ ...product, name: e.target.value })}
              placeholder="Syötä tuotteen nimi"
              required
            />
          </div>
          <Separator />
          <Accordion type="single" collapsible className="w-full overflow-x-visible">
            <AccordionItem value="pricing">
              <AccordionTrigger className="py-4 text-base font-semibold" itemType="button">
                <span className="flex items-center">
                  <Euro
                    className="w-5 h-5 mr-2"
                  />
                  Hinnat
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Voit määrittää tuotteelle oletushinnan, jota käytetään tilauksessa. Voit kuitenkin muuttaa hinnan tilauksen yhteydessä.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-base font-medium">
                    Hinta ALV 0 % (€)
                  </Label>
                  <Input
                    id="price"
                    type={isMobile ? 'number' : 'text'}
                    step={isMobile ? '0.01' : undefined}
                    min="0"
                    className="ml-[1px]"
                    style={{ width: 'calc(100% - 2px)' }}
                    value={product.price || ''}
                    onChange={e => setProduct({ ...product, price: e.target.value })}
                    onBlur={e => setProduct({ ...product, price: formatNumber(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax" className="text-base font-medium">
                    Verokanta
                  </Label>
                  <Input
                    id="tax"
                    type="text"
                    value="14 %"
                    readOnly
                    className="ml-[1px]"
                    style={{ width: 'calc(100% - 2px)' }}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="packaging">
              <AccordionTrigger className="py-4 text-base font-semibold">
                <span className="flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Pakkaustiedot
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Voit määrittää tuotteelle oletuspakkaustiedot, eli uusille tilausriveille tulee suoraan tämä pakkauskoko ja pakkaustyyppi. Voit kuitenkin muuttaa nämä tilausta tehdessä.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="packageSize" className="text-base font-medium">
                      Pakkauskoko (kg)
                    </Label>
                    <Popover open={openPackageSize} onOpenChange={setOpenPackageSize}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openPackageSize}
                          className={`w-full justify-between ${product.packageSize ? '' : 'placeholder'}`}
                        >
                          {product.packageSize || 'Valitse pakkauskoko'}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput
                            placeholder="Syötä pakkauskoko..."
                            onValueChange={value => setInputValuePackageSize(value)}
                          />
                          <CommandGroup>
                            {packageSizes
                              .filter(size => size.toString().includes(inputValuePackageSize))
                              .sort((a, b) => a - b)
                              .map(size => (
                                <CommandItem
                                  key={size}
                                  value={size.toString()}
                                  onSelect={() => {
                                    setProduct({ ...product, packageSize: size })
                                    setOpenPackageSize(false)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      product.packageSize === size ? 'opacity-100' : 'opacity-0',
                                    )}
                                  />
                                  {size}
                                  {' '}
                                  kg
                                </CommandItem>
                              ))}
                            {inputValuePackageSize.length > 0 && !packageSizes.includes(Number(inputValuePackageSize)) && (
                              <div className="p-2 border-t">
                                <button
                                  onClick={() => {
                                    const size = Number(inputValuePackageSize)
                                    if (!Number.isNaN(size) && size > 0) {
                                      setProduct({ ...product, packageSize: size })
                                      setPackageSizes([...packageSizes, size])
                                      setOpenPackageSize(false)
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
                                    {' '}
                                    kg
                                  </span>
                                </button>
                              </div>
                            )}
                          </CommandGroup>
                          <CommandEmpty>
                            <button
                              onClick={() => {
                                const size = Number(inputValuePackageSize)
                                if (!Number.isNaN(size) && size > 0) {
                                  setProduct({ ...product, packageSize: size })
                                  setPackageSizes([...packageSizes, size])
                                  setOpenPackageSize(false)
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
                                {' '}
                                kg
                              </span>
                            </button>
                          </CommandEmpty>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="packageType" className="text-base font-medium">
                      Pakkaustyyppi
                    </Label>
                    <Popover open={openPackageType} onOpenChange={setOpenPackageType}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openPackageType}
                          className={`w-full justify-between ${product.packageType ? '' : 'placeholder'}`}
                        >
                          {product.packageType || 'Valitse pakkaustyyppi'}
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
                          <CommandGroup>
                            {packageTypes
                              .filter(type => type.toLowerCase().includes(inputValuePackageType.toLowerCase()))
                              .sort()
                              .map(packageType => (
                                <CommandItem
                                  key={packageType}
                                  value={packageType}
                                  onSelect={() => {
                                    setProduct({ ...product, packageType })
                                    setOpenPackageType(false)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      product.packageType === packageType ? 'opacity-100' : 'opacity-0',
                                    )}
                                  />
                                  {packageType}
                                </CommandItem>
                              ))}
                            {inputValuePackageType.length > 0 && !packageTypes.includes(inputValuePackageType) && (
                              <div className="p-2 border-t">
                                <button
                                  onClick={() => {
                                    const type = inputValuePackageType.trim()
                                    if (type) {
                                      setProduct({ ...product, packageType: type })
                                      setPackageTypes([...packageTypes, type])
                                      setOpenPackageType(false)
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
                          <CommandEmpty>
                            <button
                              onClick={() => {
                                const type = inputValuePackageType.trim()
                                if (type) {
                                  setProduct({ ...product, packageType: type })
                                  setPackageTypes([...packageTypes, type])
                                  setOpenPackageType(false)
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
                          </CommandEmpty>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={hide} className="hidden sm:inline-flex">
            Peruuta
          </Button>
          <Button type="submit">
            <Save className="h-4 w-4 mr-2" />
            Tallenna
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
