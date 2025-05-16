"use client"

import {
    Check,
    ChevronsUpDown,
    Plus,
    Save
} from "lucide-react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import {
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { GetProductResponseDto, ProductTypeResponse } from "@/types/types"
import { Popover } from "@radix-ui/react-popover"
import axios from "axios"
import { useState } from "react"


export default function NewProduct({ productToEdit, hide, onSave, productTypes, refPackageTypes, refPackageSizes, orderIndex }: { productToEdit?: GetProductResponseDto, hide: () => void, onSave: (product: GetProductResponseDto) => void, productTypes: ProductTypeResponse[], refPackageTypes: string[], refPackageSizes: number[], orderIndex?: number }) {
    const mode = productToEdit ? 'edit' : 'create'
    const [product, setProduct] = useState<Partial<GetProductResponseDto>>(mode === 'edit' ? { ...productToEdit } : {
        orderIndex
    })
    const [openType, setOpenType] = useState(false)
    const [inputValueType, setInputValueType] = useState("")

    const [openSubtype, setOpenSubtype] = useState(false)
    const [inputValueSubtype, setInputValueSubtype] = useState("")

    const [openPackageSize, setOpenPackageSize] = useState(false)
    const [openPackageType, setOpenPackageType] = useState(false)
    const [packageSizes, setPackageSizes] = useState<number[]>([...refPackageSizes])
    const [packageTypes, setPackageTypes] = useState<string[]>([...refPackageTypes])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!product.name) {
            toast({
                title: "Virhe",
                description: "Nimi on pakollinen tieto.",
                variant: "destructive",
            })
            return
        }

        if (mode === 'edit') {
            await axios.post('/products/' + product.id, {
                ...product
            })
            onSave({ ...product } as GetProductResponseDto)
        } else {
            const res = await axios.post<{ id: string }>('/products', {
                ...product
            })

            onSave({ id: res.data.id, ...product } as GetProductResponseDto)
        }

    }

    const handleSelectType = (value: string) => {
        setProduct({ ...product, type: value })
        setOpenType(false);
    };

    const handleSelectSubtype = (value: string) => {
        setProduct({ ...product, subtype: value })
        setOpenSubtype(false);
    };

    const handleCreateType = () => {
        const newType = inputValueType.trim();
        if (newType && !productTypes.some(p => p.name === newType)) {
            // optionally: add to list or emit callback
            productTypes.push({ id: 'TODO', name: newType, orderIndex: 0, subtypes: [] });
            setProduct({ ...product, type: newType })
        }
        setOpenType(false);
    };

    const handleCreateSubtype = () => {
        if (!product.type || !productTypes) {
            return
        }
        const newType = inputValueSubtype.trim();
        if (newType && !productTypes.find(p => p.name === product.type)?.subtypes.some(p => p.name === newType)) {
            // optionally: add to list or emit callback
            productTypes.find(p => p.name === product.type)?.subtypes.push({ id: 'TODO', name: newType, orderIndex: 0 });
            setProduct({ ...product, subtype: newType })
        }
        setOpenSubtype(false);
    };

    if (!productTypes) {
        return <div></div>
    }

    return (
        <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleSubmit}>
                <DialogHeader>
                    <DialogTitle>{mode == 'create' ? 'Lisää uusi tuote' : 'Muokkaa tuotetta'}</DialogTitle>
                    <DialogDescription>
                        Täytä tuotteen tiedot. Pakolliset kentät on merkitty tähdellä (*).
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-base font-medium">
                            Nimi <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="name"
                            className="w-full"
                            value={product?.name || ""}
                            onChange={(e) => setProduct({ ...product, name: e.target.value })}
                            placeholder="Syötä tuotteen nimi"
                            required
                        />
                    </div>
                    <Separator />
                    <Accordion type="single" collapsible className="w-full overflow-x-visible">
                        {false && (
                            < AccordionItem value="grouping">
                                <AccordionTrigger className="py-3 text-base font-medium">Ryhmittelytiedot</AccordionTrigger>
                                <AccordionContent className="space-y-4 overflow-x-visible">
                                    <p className="text-sm text-muted-foreground">
                                        Ryhmittelytiedot ovat vapaaehtoisia. Niitä käytetään ryhmittelyyn keräilylistoissa.
                                    </p>
                                    <div className="space-y-2 overflow-x-visible">
                                        <Label htmlFor="variety" className="text-base font-medium">
                                            Lajike
                                        </Label>
                                        <Input
                                            id="variety"
                                            value={product.variety || ""}
                                            className="w-full overflow-x-visible"
                                            onChange={(e) => setProduct({ ...product, variety: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="type" className="text-base font-medium">
                                                Tuoteryhmä (pääryhmä)
                                            </Label>
                                            <Popover open={openType} onOpenChange={setOpenType}>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" role="combobox" className="w-full justify-between">
                                                        {product.type || "Valitse tuoteryhmä"}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-full p-0">
                                                    <Command>
                                                        <CommandInput
                                                            placeholder="Hae tai lisää"
                                                            value={inputValueType}
                                                            onValueChange={setInputValueType}
                                                        />
                                                        <CommandEmpty>
                                                            <button onClick={handleCreateType} className="flex items-center space-x-2 text-sm p-2 hover:bg-muted w-full text-left">
                                                                <Plus className="w-4 h-4" />
                                                                <span>Luo: {inputValueType}</span>
                                                            </button>
                                                        </CommandEmpty>
                                                        <CommandGroup>
                                                            {productTypes.map((type) => (
                                                                <CommandItem key={type.name} value={type.name} onSelect={handleSelectType}>
                                                                    <Check className={cn("mr-2 h-4 w-4", product.type !== null && product.type === type.name ? "opacity-100" : "opacity-0")} />
                                                                    {type.name}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="subtype" className="text-base font-medium">
                                                Tuoteryhmä (aliryhmä)
                                            </Label>
                                            <Popover open={openSubtype} onOpenChange={setOpenSubtype}>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" role="combobox" className="w-full justify-between">
                                                        {product.subtype || "Valitse aliryhmä"}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-full p-0">
                                                    <Command>
                                                        <CommandInput
                                                            placeholder="Hae tai lisää"
                                                            value={inputValueSubtype}
                                                            onValueChange={setInputValueSubtype}
                                                        />
                                                        <CommandEmpty>
                                                            <button onClick={handleCreateSubtype} className="flex items-center space-x-2 text-sm p-2 hover:bg-muted w-full text-left">
                                                                <Plus className="w-4 h-4" />
                                                                <span>Luo: {inputValueSubtype}</span>
                                                            </button>
                                                        </CommandEmpty>
                                                        <CommandGroup>
                                                            {productTypes.find(p => p.name === product.type)?.subtypes.map((subtype) => (
                                                                <CommandItem key={subtype.name} value={subtype.name} onSelect={handleSelectSubtype}>
                                                                    <Check className={cn("mr-2 h-4 w-4", product.subtype === subtype.name ? "opacity-100" : "opacity-0")} />
                                                                    {subtype.name}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        )}
                        <AccordionItem value="pricing">
                            <AccordionTrigger className="py-3 text-base font-medium">Hinta</AccordionTrigger>
                            <AccordionContent className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    Hinta on vapaaehtoinen tieto. Voit aina muokata hinnan tilauksen yhteydessä.
                                </p>
                                <div className="space-y-2">
                                    <Label htmlFor="price" className="text-base font-medium">
                                        Hinta ALV 14 % (€)
                                    </Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="ml-[1px]"
                                        style={{ width: "calc(100% - 2px)" }}
                                        value={product.price || ""}
                                        onChange={(e) =>
                                            setProduct({ ...product, price: toDecimal(Number.parseFloat(e.target.value) || 0), price0: toDecimal(Number.parseFloat(e.target.value) / 1.14) })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="price0" className="text-base font-medium">
                                        Hinta ALV 0 % (€)
                                    </Label>
                                    <Input
                                        id="price0"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="ml-[1px]"
                                        style={{ width: "calc(100% - 2px)" }}
                                        value={product.price0 || ""}
                                        onChange={(e) =>
                                            setProduct({ ...product, price: toDecimal(Number.parseFloat(e.target.value) * 1.14 || 0), price0: toDecimal(Number.parseFloat(e.target.value)) })
                                        }
                                    />
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="packaging">
                            <AccordionTrigger className="py-3 text-base font-medium">Pakkaustiedot</AccordionTrigger>
                            <AccordionContent className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    Pakkaustiedot ovat vapaaehtoisia. Niitä käytetään tilauksen yhteydessä.
                                </p>
                                <div className="grid grid-cols-2 gap-4">
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
                                                    className="w-full justify-between"
                                                >
                                                    {product.packageSize || "Valitse pakkauskoko"}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-full p-0">
                                                <Command>
                                                    <CommandInput
                                                        placeholder="Syötä pakkauskoko..."
                                                        onValueChange={(value) => setInputValueType(value)}
                                                    />
                                                    <CommandGroup>
                                                        {packageSizes
                                                            .filter(size => size.toString().includes(inputValueType))
                                                            .sort((a, b) => a - b)
                                                            .map((size) => (
                                                                <CommandItem
                                                                    key={size}
                                                                    value={size.toString()}
                                                                    onSelect={() => {
                                                                        setProduct({ ...product, packageSize: size });
                                                                        setOpenPackageSize(false);
                                                                    }}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            product.packageSize === size ? "opacity-100" : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {size} kg
                                                                </CommandItem>
                                                            ))}
                                                    </CommandGroup>
                                                    {(!inputValueType || !packageSizes.some(size => size.toString() === inputValueType)) && (
                                                        <CommandEmpty>
                                                            <button
                                                                onClick={() => {
                                                                    const size = Number(inputValueType);
                                                                    if (!isNaN(size) && size > 0) {
                                                                        setProduct({ ...product, packageSize: size });
                                                                        setPackageSizes([...packageSizes, size]);
                                                                        setOpenPackageSize(false);
                                                                    }
                                                                }}
                                                                className="flex items-center space-x-2 text-sm p-2 hover:bg-muted w-full text-left"
                                                            >
                                                                <Plus className="w-4 h-4" />
                                                                <span>Lisää: {inputValueType} kg</span>
                                                            </button>
                                                        </CommandEmpty>
                                                    )}
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
                                                    className="w-full justify-between"
                                                >
                                                    {product.packageType ?? "Valitse pakkaus"}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-full p-0">
                                                <Command>
                                                    <CommandInput
                                                        placeholder="Syötä pakkaustyyppi..."
                                                        onValueChange={(value) => setInputValueType(value)}
                                                    />
                                                    <CommandGroup>
                                                        {packageTypes
                                                            .filter(type => type.toLowerCase().includes(inputValueType.toLowerCase()))
                                                            .sort()
                                                            .map((packageType) => (
                                                                <CommandItem
                                                                    key={packageType}
                                                                    value={packageType}
                                                                    onSelect={() => {
                                                                        setProduct({ ...product, packageType });
                                                                        setOpenPackageType(false);
                                                                    }}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            product.packageType === packageType ? "opacity-100" : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {packageType}
                                                                </CommandItem>
                                                            ))}
                                                    </CommandGroup>
                                                    {(!inputValueType || !packageTypes.some(type => type.toLowerCase() === inputValueType.toLowerCase())) && (
                                                        <CommandEmpty>
                                                            <button
                                                                onClick={() => {
                                                                    const type = inputValueType.trim();
                                                                    if (type) {
                                                                        setProduct({ ...product, packageType: type });
                                                                        setPackageTypes([...packageTypes, type]);
                                                                        setOpenPackageType(false);
                                                                    }
                                                                }}
                                                                className="flex items-center space-x-2 text-sm p-2 hover:bg-muted w-full text-left"
                                                            >
                                                                <Plus className="w-4 h-4" />
                                                                <span>Lisää: {inputValueType}</span>
                                                            </button>
                                                        </CommandEmpty>
                                                    )}
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
                    <Button variant="outline" onClick={hide}>
                        Peruuta
                    </Button>
                    <Button type="submit">
                        <Save className="h-4 w-4 mr-2" />
                        Tallenna
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent >
    );
}

export const toDecimal = (num: number) => Number(num.toFixed(2))