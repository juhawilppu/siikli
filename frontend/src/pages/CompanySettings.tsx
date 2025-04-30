"use client"

import type React from "react"

import { Save } from "lucide-react"
import { useEffect, useState } from "react"

import SiikliPage from "@/SiikliPage"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { GetCompanySettings, PostCompanySettings } from "@/types/types"
import axios from "axios"

export default function CompanySettings() {
  const [companyData, setCompanyData] = useState<GetCompanySettings>()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value }: { name: string, value: string } = e.target
    setCompanyData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [name]: typeof prev[name as keyof GetCompanySettings] === 'string' ? value : Number(value)
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically save the data to your backend
    console.log("Saving company data:", companyData)
    // Show success message or handle errors
    await axios.post<PostCompanySettings>("/tenants", companyData)
    toast({
      title: "Yritys tiedot tallennettu",
      description: "Yrityksesi tiedot on tallennettu",
      variant: "success",
    })
  }


  useEffect(() => {
    axios
      .get(`/tenants`)
      .then((response) => {
        setCompanyData(response.data)
      })
  }, [])

  if (!companyData) {
    return <div></div>
  }

  return (
    <>
      <SiikliPage title="Oma yritys" description="Voit hallinnoida yrityksesi asetuksia täällä.">


        <Tabs defaultValue="company" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="company">Yritys</TabsTrigger>
            <TabsTrigger value="users">Käyttäjät</TabsTrigger>
            <TabsTrigger value="preferences">Asetukset</TabsTrigger>
          </TabsList>

          <TabsContent value="company">
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>Yritys</CardTitle>
                  <CardDescription>
                    Päivitä yrityksesi tiedot. Tiedot näytetään kuormakirjoissa ja maksutilauksissa.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nimi</Label>
                        <Input id="name" name="name" value={companyData.name} onChange={handleInputChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="businessId">Y-tunnus</Label>
                        <Input
                          id="businessId"
                          name="businessId"
                          value={companyData.businessId}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <Separator className="my-4" />
                    <h3 className="text-lg font-medium">Osoite</h3>

                    <div className="space-y-2">
                      <Label htmlFor="streetAddress">Katuosoite</Label>
                      <Input
                        id="streetAddress"
                        name="streetAddress"
                        value={companyData.streetAddress}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="postalCode">Postinumero</Label>
                        <Input
                          id="postalCode"
                          name="postalCode"
                          value={companyData.postalCode}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="city">Kaupunki</Label>
                        <Input id="city" name="city" value={companyData.city} onChange={handleInputChange} />
                      </div>
                    </div>

                    <Separator className="my-4" />
                    <h3 className="text-lg font-medium">Pankkitiedot</h3>
                    <CardDescription>
                      Pankkitietoja käytetään laskuissa.
                    </CardDescription>
                    <div className="space-y-2">
                      <Label htmlFor="bankName">Pankin nimi</Label>
                      <Input
                        id="bankName"
                        name="bankName"
                        value={companyData.invoiceBankName}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="bankAccount">Pankkitilin numero (IBAN)</Label>
                        <Input
                          id="bankAccount"
                          name="bankAccount"
                          value={companyData.invoiceBankAccount}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="swiftBic">SWIFT/BIC</Label>
                        <Input
                          id="swiftBic"
                          name="swiftBic"
                          value={companyData.invoiceReference}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <Separator className="my-4" />
                    <h3 className="text-lg font-medium">Yhteystiedot</h3>
                    <CardDescription>
                      Yhteystiedot näytetään laskuissa.
                    </CardDescription>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Puhelinnumero</Label>
                        <Input id="phone" name="phone" value={companyData.phone} onChange={handleInputChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Sähköposti</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={companyData.email}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">WWW-sivu</Label>
                      <Input
                        id="website"
                        name="website"
                        value={companyData.website}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button variant="outline">Peruuta</Button>
                  <Button type="submit">
                    <Save className="mr-2 h-4 w-4" />
                    Tallenna
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Käyttäjät</CardTitle>
                <CardDescription>Hallitse käyttäjiä ja oikeuksia</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">User management settings will appear here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Asetukset</CardTitle>
                <CardDescription>Hallitse järjestelmän asetuksia.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">System preferences settings will appear here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </SiikliPage>
    </>
  )
}

