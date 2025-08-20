import type { GetCustomerRequestDto, PostCreateCustomerRequestDto } from '@siikli/shared'
import { formatNumber } from '@siikli/shared'
import axios from 'axios'
import { FileText, HelpCircle, Phone, Save } from 'lucide-react'
import { useState } from 'react'
import { toast } from '@/app/hooks/use-toast'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

function instructionTooltip(text: string) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <TooltipProvider>
      <Tooltip delayDuration={0} open={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger asChild>
          <div
            className="inline-flex items-center cursor-pointer hover:opacity-80"
            onClick={() => setIsOpen(!isOpen)}
          >
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

export function NewCustomer({ closeDialog, customerToEdit, onSave }: {
  closeDialog: () => void
  customerToEdit?: GetCustomerRequestDto
  onSave: () => void
}) {
  const [customer, setCustomer] = useState<
    {
      id: string | null
      name: string
      companyLegalName: string | null
      discount: string
      invoiceReference: string | null
      streetAddress: string | null
      postalCode: string | null
      city: string | null
      businessId: string | null
      email: string | null
      phone: string | null
    }
  >(customerToEdit
    ? { ...customerToEdit, discount: formatNumber(customerToEdit?.discount) }
    : {
        id: null,
        name: '',
        companyLegalName: '',
        discount: '',
        invoiceReference: '',
        streetAddress: '',
        postalCode: '',
        city: '',
        businessId: '',
        email: '',
        phone: '',
      })

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
      <DialogContent className="sm:max-w-[500px] w-full h-full sm:h-auto overflow-y-auto">
        <form className="flex flex-col h-full">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">{customerToEdit ? 'Muokkaa asiakasta' : 'Uusi asiakas'}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="font-medium">
                Nimi
                {' '}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-name"
                className="w-full"
                value={customer.name}
                onChange={e => setCustomer({ ...customer, name: e.target.value })}
                maxLength={50}
                required
              />
            </div>
          </div>
          <Separator />
          <Accordion type="single" collapsible className="w-full overflow-x-visible">
            <AccordionItem value="contact">
              <AccordionTrigger className="py-4 text-base font-semibold">
                <span className="flex items-center">
                  <Phone className="w-5 h-5 mr-2" />
                  Yhteystiedot
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 overflow-x-visible">
                <div className="space-y-2">
                  <Label htmlFor="edit-address" className="font-medium">
                    Katuosoite
                  </Label>
                  <Input
                    id="edit-address"
                    value={customer.streetAddress || ''}
                    className="ml-[1px] mr-[1px] w-[calc(100%-2px)]"
                    onChange={e => setCustomer({ ...customer, streetAddress: e.target.value })}
                    maxLength={255}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-postal_code" className="font-medium">
                      Postinumero
                    </Label>
                    <Input
                      id="edit-postal_code"
                      value={customer.postalCode || ''}
                      className="ml-[1px] mr-[1px] w-[calc(100%-2px)]"
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
                      className="ml-[1px] mr-[1px] w-[calc(100%-2px)]"
                      maxLength={255}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-email" className="font-medium">
                      Sähköposti
                    </Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={customer.email || ''}
                      onChange={e => setCustomer({ ...customer, email: e.target.value })}
                      className="ml-[1px] mr-[1px] w-[calc(100%-2px)]"
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
                      className="ml-[1px] mr-[1px] w-[calc(100%-2px)]"
                      maxLength={255}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="invoicing">
              <AccordionTrigger className="py-4 text-base font-semibold">
                <span className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Laskutustiedot
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 overflow-x-visible">
                <div className="space-y-2">
                  <Label htmlFor="edit-business_id" className="font-medium">
                    Y-tunnus
                  </Label>
                  <Input
                    id="edit-business_id"
                    placeholder="1234567-8"
                    value={customer.businessId || ''}
                    onChange={e => setCustomer({ ...customer, businessId: e.target.value })}
                    className="ml-[1px] mr-[1px] w-[calc(100%-2px)]"
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
                    className="ml-[1px] mr-[1px] w-[calc(100%-2px)]"
                    maxLength={255}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex">
                    <Label htmlFor="edit-discount" className="font-medium">
                      Alennus (%)
                    </Label>
                    {instructionTooltip('Tämä asettaa yritykselle yleisen alennuksen, joka vaikuttaa kaikkiin laskuihin. Esimerkiksi 10 % tarkoittaa 10 % alennusta.')}
                  </div>
                  <Input
                    id="edit-discount"
                    placeholder="0,00"
                    value={customer.discount}
                    className="ml-[1px] mr-[1px] w-[calc(100%-2px)]"
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
                    className="ml-[1px] mr-[1px] w-[calc(100%-2px)]"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <DialogFooter className="sticky bottom-0 bg-background z-10 pt-4 gap-2 sm:gap-0">
            <Button variant="outline" onClick={closeDialog} className="hidden sm:inline-flex">
              Peruuta
            </Button>
            <Button type="button" onClick={save}>
              <Save className="h-4 w-4 mr-2" />
              Tallenna
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
