import type { GetProductsResponse } from '@siikli/shared'

import { Popover } from '@radix-ui/react-popover'
import { formatNumber, parseToNumber, PostCreateProductRequest } from '@siikli/shared'
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
import { useTranslation } from '@/lib/translations'
import { cn } from '@/lib/utils'
import { serializeNumber } from '@/utils/serialization'

export default function NewProduct({ productToEdit, hide, onSave, refPackageTypes, refPackageSizes }: { productToEdit?: GetProductsResponse, hide: () => void, onSave: (product: GetProductsResponse) => void, refPackageTypes: string[], refPackageSizes: number[] }) {
  const t = useTranslation()
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
        title: t('productForm.submit.error.name.title'),
        description: t('productForm.submit.error.name.description'),
        variant: 'destructive',
      })
      return
    }

    const data = PostCreateProductRequest.parse({
      name: product.name,
      price: product.price ? serializeNumber(product.price) : undefined,
      packageSize: product.packageSize || undefined,
      packageType: product.packageType || '',
    })

    if (mode === 'edit') {
      await axios.put(`/products/${product.id}`, data)
      onSave({ ...product, id: product.id as string, name: product.name as string, packageSize: product.packageSize || null, packageType: product.packageType || null, price: product.price ? serializeNumber(product.price) : undefined } satisfies GetProductsResponse)
    }
    else {
      const res = await axios.post<{ id: string }>('/products', data)

      onSave({ ...product, id: res.data.id, price: product.price } as GetProductsResponse)
    }
  }

  return (
    <DialogContent className="sm:max-w-[500px] w-full h-full sm:h-auto overflow-y-auto">
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">{mode === 'create' ? t('productForm.newProduct') : t('productForm.editProduct')}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base font-medium">
              {t('productForm.name.label')}
              {' '}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              className="w-full"
              value={product?.name || ''}
              onChange={e => setProduct({ ...product, name: e.target.value })}
              placeholder={t('productForm.name.placeholder')}
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
                  {t('productForm.pricing.label')}
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {t('productForm.pricing.description')}
                </p>
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-base font-medium">
                    {t('productForm.pricing.price.label')}
                  </Label>
                  <Input
                    id="price"
                    type={isMobile ? 'number' : 'text'}
                    min={isMobile ? 0 : undefined}
                    step={isMobile ? 0.01 : undefined}
                    className="ml-[1px]"
                    style={{ width: 'calc(100% - 2px)' }}
                    value={isMobile ? parseToNumber(product.price) : product.price}
                    onChange={e => setProduct({ ...product, price: e.target.value })}
                    onBlur={e => setProduct({ ...product, price: formatNumber(e.target.value) })}
                    inputMode="decimal"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax" className="text-base font-medium">
                    {t('productForm.pricing.tax.label')}
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
                  {t('productForm.packaging.label')}
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {t('productForm.packaging.description')}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="packageSize" className="text-base font-medium">
                      {t('productForm.packaging.packageSize.label')}
                    </Label>
                    <Popover open={openPackageSize} onOpenChange={setOpenPackageSize}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openPackageSize}
                          className={`w-full justify-between ${product.packageSize ? '' : 'placeholder'}`}
                        >
                          {product.packageSize || t('productForm.packaging.packageSize.select')}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput
                            placeholder={t('productForm.packaging.packageSize.enter')}
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
                                        title: t('productForm.packaging.packageSize.error.title'),
                                        description: t('productForm.packaging.packageSize.error.description'),
                                        variant: 'destructive',
                                      })
                                    }
                                  }}
                                  className="flex items-center space-x-2 text-sm p-2 hover:bg-muted w-full text-left"
                                >
                                  <Plus className="w-4 h-4" />
                                  <span>
                                    {t('productForm.create')}
                                    :
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
                                    title: t('productForm.packaging.packageSize.error.title'),
                                    description: t('productForm.packaging.packageSize.error.description'),
                                    variant: 'destructive',
                                  })
                                }
                              }}
                              className="flex items-center space-x-2 text-sm p-2 hover:bg-muted w-full text-left"
                            >
                              <Plus className="w-4 h-4" />
                              <span>
                                {t('productForm.create')}
                                :
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
                      {t('productForm.packaging.packageType.label')}
                    </Label>
                    <Popover open={openPackageType} onOpenChange={setOpenPackageType}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openPackageType}
                          className={`w-full justify-between ${product.packageType ? '' : 'placeholder'}`}
                        >
                          {product.packageType || t('productForm.packaging.packageType.select')}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput
                            placeholder={t('productForm.packaging.packageType.enter')}
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
                                    {t('productForm.create')}
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
                                {t('productForm.create')}
                                :
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
            {t('productForm.cancel')}
          </Button>
          <Button type="submit">
            <Save className="h-4 w-4 mr-2" />
            {t('productForm.save')}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
