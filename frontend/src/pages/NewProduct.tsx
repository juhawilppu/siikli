"use client"

import {
    Check,
    ChevronsUpDown,
    Plus,
    Save
} from "lucide-react"

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { FullProductDto, ProductTypeResponse } from "@/types/types"
import { Popover } from "@radix-ui/react-popover"
import axios from "axios"
import { useState } from "react"




export default function NewProduct({ productToEdit, hide, onSave, productTypes, packageSizes, orderIndex }: { productToEdit?: FullProductDto, hide: () => void, onSave: (product: FullProductDto) => void, productTypes: ProductTypeResponse[], packageSizes: string[], orderIndex?: number }) {
    const mode = productToEdit ? 'edit' : 'create'
    const [product, setProduct] = useState<Partial<FullProductDto>>(mode === 'edit' ? { ...productToEdit } : {
        orderIndex
    })
    const [open, setOpen] = useState(false)
    const [inputValue, setInputValue] = useState("")

    const handleFormSave = async () => {
        if (!product.name || !product.type) {
            toast({
                title: "Virhe",
                description: "Nimi ja tuoteryhmä ovat pakollisia tietoja.",
                variant: "destructive",
            })
            return
        }

        if (mode === 'edit') {
            await axios.post('/products/' + product.id, {
                ...product
            })
            onSave({ ...product } as FullProductDto)
        } else {
            const res = await axios.post<{ id: string }>('/products', {
                ...product
            })

            onSave({ id: res.data.id, ...product } as FullProductDto)
        }

    }
    const handleSelect = (value: string) => {
        setProduct({ ...product, type: value })
        setOpen(false);
    };

    const handleCreate = () => {
        const newType = inputValue.trim();
        if (newType && !productTypes.some(p => p.type === newType)) {
            // optionally: add to list or emit callback
            productTypes.push({ type: newType, subtypes: [] });
            setProduct({ ...product, type: newType })
        }
        setOpen(false);
    };
    return (
        <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
                <DialogTitle>{mode == 'create' ? 'Lisää uusi tuote' : 'Muokkaa tuotetta'}</DialogTitle>
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
                            value={product?.name || ""}
                            onChange={(e) => setProduct({ ...product, name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="variety" className="font-medium">
                            Lajike
                        </Label>
                        <Input
                            id="variety"
                            value={product.variety || ""}
                            onChange={(e) => setProduct({ ...product, variety: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="type" className="font-medium">
                            Tuoteryhmä *
                        </Label>
                        <Popover open={open} onOpenChange={setOpen}>
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
                                        value={inputValue}
                                        onValueChange={setInputValue}
                                    />
                                    <CommandEmpty>
                                        <button onClick={handleCreate} className="flex items-center space-x-2 text-sm p-2 hover:bg-muted w-full text-left">
                                            <Plus className="w-4 h-4" />
                                            <span>Luo: {inputValue}</span>
                                        </button>
                                    </CommandEmpty>
                                    <CommandGroup>
                                        {productTypes.map((type) => (
                                            <CommandItem key={type.type} value={type.type} onSelect={handleSelect}>
                                                <Check className={cn("mr-2 h-4 w-4", product.type === type.type ? "opacity-100" : "opacity-0")} />
                                                {type.type}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="subtype" className="font-medium">
                            Aliryhmä
                        </Label>
                        <Select
                            value={product.subtype ?? undefined}
                            onValueChange={(value) => setProduct({ ...product, subtype: value })}
                            disabled={!product.type}
                        >
                            <SelectTrigger id="subtype">
                                <SelectValue placeholder="Valitse aliryhmä" />
                            </SelectTrigger>
                            <SelectContent>
                                {productTypes.find(t => t.type === product.type)?.subtypes.map(subType => (
                                    <SelectItem key={subType} value={subType}>
                                        {subType}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="packageSize" className="font-medium">
                            Pakkauskoko (kg)
                        </Label>
                        <Input
                            id="packageSize"
                            type="number"
                            step="0.01"
                            min="0"
                            value={product.packageSize || ""}
                            onChange={(e) =>
                                setProduct({
                                    ...product,
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
                            value={product.packageType ?? undefined}
                            onValueChange={(value) => setProduct({ ...product, packageType: value })}
                        >
                            <SelectTrigger id="packageType">
                                <SelectValue placeholder="Valitse pakkaus" />
                            </SelectTrigger>
                            <SelectContent>
                                {packageSizes.map((packageSize) => (
                                    <SelectItem key={packageSize} value={packageSize}>
                                        {packageSize}
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
                            value={product.price || ""}
                            onChange={(e) =>
                                setProduct({ ...product, price: toDecimal(Number.parseFloat(e.target.value) || 0), price0: toDecimal(Number.parseFloat(e.target.value) / 1.14) })
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
                            value={product.price0 || ""}
                            onChange={(e) =>
                                setProduct({ ...product, price: toDecimal(Number.parseFloat(e.target.value) * 1.14 || 0), price0: toDecimal(Number.parseFloat(e.target.value)) })
                            }
                        />
                        <p className="text-xs text-muted-foreground">Voit antaa joko ALV 14 % tai ALV 0 % hinnan. Toinen muuttaa toista.</p>
                    </div>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={hide}>
                    Peruuta
                </Button>
                <Button type="button" onClick={handleFormSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Tallenna
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}

export const toDecimal = (num: number) => Number(num.toFixed(2))