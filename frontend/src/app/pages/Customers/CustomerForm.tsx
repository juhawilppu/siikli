import type { GetCustomerRequestDto, PostCreateCustomerRequestDto } from '@/app/types/types'
import axios from 'axios'
import { Check, ChevronsUpDown, HelpCircle, Plus, Save } from 'lucide-react'
import { useState } from 'react'
import { toast } from '@/app/hooks/use-toast'
import { formatNumber } from '@/app/utils/money'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

function instructionTooltip(text: string) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center cursor-pointer hover:opacity-80">
            <HelpCircle className="h-4 w-4 text-muted-foreground ml-1" />
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-[300px]">
          <p>{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function NewCustomer({ closeDialog, customerToEdit, forwaredCustomerGroups, onSave }: {
  closeDialog: () => void
  customerToEdit?: GetCustomerRequestDto
  forwaredCustomerGroups: string[]
  onSave: () => void
}) {
  const [customer, setCustomer] = useState<
    {
      id: string | null
      name: string
      companyLegalName: string | null
      customerGroup: string | null
      discount: string
      invoiceReference: string | null
      streetAddress: string | null
      postalCode: string | null
      city: string | null
      businessId: string | null
      email: string | null
      phone: string | null
      showPriceWithoutTax: boolean
    }
  >(customerToEdit
    ? { ...customerToEdit, discount: formatNumber(customerToEdit?.discount) }
    : {
        id: null,
        name: '',
        companyLegalName: '',
        customerGroup: '',
        discount: '',
        invoiceReference: '',
        streetAddress: '',
        postalCode: '',
        city: '',
        businessId: '',
        email: '',
        phone: '',
        showPriceWithoutTax: false,
      })
  const [customerGroups, setCustomerGroups] = useState<string[]>(forwaredCustomerGroups)
  const [inputValueCustomerGroup, setInputValueCustomerGroup] = useState('')
  const [isCustomerGroupPopoverOpen, setIsCustomerGroupPopoverOpen] = useState(false)

  const handleCreateCustomerGroup = () => {
    if (inputValueCustomerGroup && !customerGroups.includes(inputValueCustomerGroup)) {
      console.log('Create customer group', inputValueCustomerGroup)
      setCustomerGroups([...customerGroups, inputValueCustomerGroup])
    }
    setCustomer({ ...customer, customerGroup: inputValueCustomerGroup })
    setInputValueCustomerGroup('')
    setIsCustomerGroupPopoverOpen(false)
  }

  const saveCustomerToEdit = () => {
    if (!customer || !customer.id)
      return

    const updateCustomer: PostCreateCustomerRequestDto = {
      ...customer,
      discount: Number.parseFloat(customer.discount),
    } satisfies PostCreateCustomerRequestDto

    axios
      .put(`/customers/${customer.id}`, updateCustomer)
      .then(() => {
        onSave()
        toast({
          title: 'Asiakkaan päivitys onnistui',
          description: `Asiakas ${customer.name} on päivitetty onnistuneesti.`,
          variant: 'success',
        })
      })
      .catch((error) => {
        console.error(error)
        toast({
          title: 'Virhe',
          description: 'Asiakkaan päivitys epäonnistui.',
          variant: 'destructive',
        })
      })
  }

  const createCustomer = () => {
    const newCustomer: PostCreateCustomerRequestDto = {
      ...customer,
      discount: Number.parseFloat(customer.discount),
    } as PostCreateCustomerRequestDto

    axios
      .post('/customers', newCustomer)
      .then(() => {
        onSave()
        closeDialog()
        toast({
          title: 'Asiakas lisätty',
          description: `Asiakas ${newCustomer.name} on lisätty onnistuneesti.`,
          variant: 'success',
        })
      })
      .catch((error) => {
        console.error(error)
        toast({
          title: 'Virhe',
          description: 'Asiakkaan lisäys epäonnistui.',
          variant: 'destructive',
        })
      })
  }

  const save = () => {
    console.log('onSave', customer)

    if (!customer.name) {
      toast({
        title: 'Virhe',
        description: 'Nimi on pakollinen tieto.',
        variant: 'destructive',
      })
      return
    }

    if (customer.email) {
      const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/
      const isValidEmail = emailRegex.test(customer.email)
      if (!isValidEmail) {
        toast({
          title: 'Virhe',
          description: 'Virheellinen sähköpostiosoite.',
          variant: 'destructive',
        })
        return
      }
    }

    if (customer.phone) {
      const phoneRegex = /^\+?\d{8,15}$/
      const isValidPhone = phoneRegex.test(customer.phone.replace(/\s/g, ''))
      if (!isValidPhone) {
        toast({
          title: 'Virhe',
          description: 'Virheellinen puhelinnumero.',
          variant: 'destructive',
        })
        return
      }
    }

    if (customer.discount && Number.parseFloat(customer.discount) > 100) {
      toast({
        title: 'Virhe',
        description: 'Alennus ei voi olla suurempi kuin 100%.',
        variant: 'destructive',
      })
    }

    if (customerToEdit) {
      saveCustomerToEdit()
    }
    else {
      createCustomer()
    }
  }

  return (
    <Dialog open={true} onOpenChange={closeDialog}>
      <DialogContent className="sm:max-w-[600px] max-h-[100vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-muted-foreground">{customerToEdit ? 'Muokkaa asiakasta' : 'Uusi asiakas'}</DialogTitle>
          <DialogDescription className="text-gray-700">
            {customerToEdit ? 'Muokkaa asiakkaan tietoja.' : 'Lisää uusi asiakas.'}
            {' '}
            Pakolliset kentät on merkitty tähdellä (*).
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-1">
          <div className="grid gap-4 py-4">
            {/* pl-[1px] to fix scrollbar width */}
            <h2 className="text-lg font-medium">Perustiedot</h2>
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="font-medium">
                Nimi *
              </Label>
              <Input
                id="edit-name"
                value={customer.name}
                onChange={e => setCustomer({ ...customer, name: e.target.value })}
                maxLength={50}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-customer_group" className="font-medium">
                  Asiakasryhmä
                </Label>
                <Popover open={isCustomerGroupPopoverOpen} onOpenChange={setIsCustomerGroupPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className={`w-full justify-between ${customer.customerGroup ? '' : 'placeholder'}`}>
                      {customer.customerGroup || 'Valitse asiakasryhmä'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <div className="p-2">
                      <Input
                        placeholder="Hae tai lisää"
                        value={inputValueCustomerGroup}
                        onChange={(e) => {
                          setInputValueCustomerGroup(e.target.value)
                        }}
                        className="mb-2"
                      />
                      {inputValueCustomerGroup && !customerGroups.includes(inputValueCustomerGroup) && (
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={handleCreateCustomerGroup}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Luo:
                          {' '}
                          {inputValueCustomerGroup}
                        </Button>
                      )}
                    </div>
                    <div className="max-h-[200px] overflow-y-auto">
                      {customerGroups.sort((a, b) => a.localeCompare(b)).map(customerGroup => (
                        <Button
                          key={customerGroup}
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => {
                            setCustomer({ ...customer, customerGroup })
                            setIsCustomerGroupPopoverOpen(false)
                          }}
                        >
                          <Check className={cn('mr-2 h-4 w-4', customer.customerGroup === customerGroup ? 'opacity-100' : 'opacity-0')} />
                          {customerGroup || 'Ei ryhmää'}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <h2 className="text-lg font-medium">Yhteystiedot</h2>
            <div className="space-y-2">
              <Label htmlFor="edit-address" className="font-medium">
                Katuosoite
              </Label>
              <Input
                id="edit-address"
                value={customer.streetAddress || ''}
                onChange={e => setCustomer({ ...customer, streetAddress: e.target.value })}
                maxLength={255}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-postal_code" className="font-medium">
                  Postinumero
                </Label>
                <Input
                  id="edit-postal_code"
                  value={customer.postalCode || ''}
                  onChange={e => setCustomer({ ...customer, postalCode: e.target.value })}
                  maxLength={5}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-city" className="font-medium">
                  Kaupunki
                </Label>
                <Input
                  id="edit-city"
                  value={customer.city || ''}
                  onChange={e => setCustomer({ ...customer, city: e.target.value })}
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
                  value={customer.email || ''}
                  onChange={e => setCustomer({ ...customer, email: e.target.value })}
                  maxLength={255}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone" className="font-medium">
                  Puhelin
                </Label>
                <Input
                  id="edit-phone"
                  value={customer.phone || ''}
                  onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                  maxLength={255}
                />
              </div>
            </div>
            <h2 className="text-lg font-medium">Laskutuksen asetukset</h2>
            <div className="space-y-2">
              <Label htmlFor="edit-business_id" className="font-medium">
                Y-tunnus
              </Label>
              <Input
                id="edit-business_id"
                placeholder="1234567-8"
                value={customer.businessId || ''}
                onChange={e => setCustomer({ ...customer, businessId: e.target.value })}
                maxLength={255}
              />
            </div>
            <div className="space-y-2">
              <span className="flex">
                <Label htmlFor="edit-company_legal_name" className="font-medium">
                  Yrityksen virallinen nimi
                </Label>
                {instructionTooltip('Yrityksen virallinen kaupparekisterissä oleva nimi, jota käytetään laskuissa. Jos tämä on tyhjä, käytetään nimeä.')}
              </span>
              <Input
                id="edit-company_legal_name"
                placeholder="Oy Myymäläketju Ab"
                value={customer.companyLegalName || ''}
                onChange={e => setCustomer({ ...customer, companyLegalName: e.target.value })}
                maxLength={255}
              />
            </div>
            <div className="space-y-2">
              <div className="flex">
                <Label htmlFor="edit-discount" className="font-medium">
                  Alennus (%)
                </Label>
                {instructionTooltip('Tämä asettaa yritykselle yleisen alennuksen, joka vaikuttaa kaikkiin laskuihin. Esimerkiksi 10,00 tarkoittaa 10 % alennusta.')}
              </div>
              <Input
                id="edit-discount"
                placeholder="0,00"
                value={customer.discount}
                onChange={e =>
                  setCustomer({
                    ...customer,
                    discount: e.target.value,
                  })}
                onBlur={(e) => {
                  setCustomer({
                    ...customer,
                    discount: formatNumber(e.target.value),
                  })
                }}
              />
            </div>
            <div className="space-y-2">
              <span className="flex">
                <Label htmlFor="edit-reference" className="font-medium">
                  Laskun viite
                </Label>
                {instructionTooltip('Voit määrittää viitekoodin, joka näkyy laskuissa.')}
              </span>
              <Input
                id="edit-reference"
                value={customer.invoiceReference || ''}
                onChange={e => setCustomer({ ...customer, invoiceReference: e.target.value })}
                maxLength={255}
              />
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <span className="flex">
                <Label htmlFor="edit-show_price_without_tax" className="font-medium">
                  Näytä hinnat ilman veroa
                </Label>
                {instructionTooltip('Jos olet sopinut asiakkaan kanssa ALV 0 % hinnat, valitse tämä. Tämän jälkeen laskuissa näytetään ALV 0 % hinnat. Tämä asetus on tehty, jotta vältytään pyöristysvirheiltä.')}
              </span>
              <Checkbox
                id="edit-show_price_without_tax"
                checked={customer.showPriceWithoutTax}
                onCheckedChange={checked =>
                  setCustomer({ ...customer, showPriceWithoutTax: checked as boolean })}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button type="button" onClick={save}>
            <Save className="h-4 w-4 mr-2" />
            Tallenna muutokset
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
