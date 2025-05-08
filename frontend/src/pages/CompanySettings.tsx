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
import { GetCompanySettings, PostCompanySettings, PostSubscriptionChangeRequest } from "@/types/types"
import { formatDate } from "@/utils/date"
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

  const switchSubscription = async (subscription: "FREE" | "PREMIUM") => {
    const result = await axios.post<PostSubscriptionChangeRequest>("/tenants/subscription", {
      subscription,
    })
    toast({
      title: "Tilausvaihto",
      description: "Tilausvaihto onnistui",
      variant: "success",
    })
    setCompanyData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        subscriptionType: result.data.subscriptionType,
        trialEndDate: result.data.trialEndDate,
        subscriptionStartDate: result.data.subscriptionStartDate,
        subscriptionEndDate: result.data.subscriptionEndDate,
      }
    })
  }


  useEffect(() => {
    axios
      .get<GetCompanySettings>(`/tenants`)
      .then((response) => {
        setCompanyData(response.data)
      })
  }, [])

  if (!companyData) return <SiikliPage title="Oma yritys" description="Voit hallinnoida yrityksesi asetuksia täällä." />

  return (
    <>
      <SiikliPage title="Oma yritys" description="Voit hallinnoida yrityksesi asetuksia täällä.">


        <Tabs defaultValue="company" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="company">Yritys</TabsTrigger>
            <TabsTrigger value="users">Käyttäjät</TabsTrigger>
            <TabsTrigger value="preferences">Asetukset</TabsTrigger>
            <TabsTrigger value="subscription">Tilaus</TabsTrigger>
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
                          value={companyData.businessId || ''}
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
                        value={companyData.streetAddress || ''}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="postalCode">Postinumero</Label>
                        <Input
                          id="postalCode"
                          name="postalCode"
                          value={companyData.postalCode || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="city">Kaupunki</Label>
                        <Input id="city" name="city" value={companyData.city || ''} onChange={handleInputChange} />
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
                        value={companyData.invoiceBankName || ''}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="bankAccount">Pankkitilin numero (IBAN)</Label>
                        <Input
                          id="bankAccount"
                          name="bankAccount"
                          value={companyData.invoiceBankAccount || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="swiftBic">SWIFT/BIC</Label>
                        <Input
                          id="swiftBic"
                          name="swiftBic"
                          value={companyData.invoiceReference || ''}
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
                        <Input id="phone" name="phone" value={companyData.phone || ''} onChange={handleInputChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Sähköposti</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={companyData.email || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">WWW-sivu</Label>
                      <Input
                        id="website"
                        name="website"
                        value={companyData.website || ''}
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

          <TabsContent value="subscription">
            <Card>
              <CardHeader>
                <CardTitle>Tilaustiedot</CardTitle>
                <CardDescription>Hallitse Siikli ERP -tilaustasi ja näe tilauksesi tila.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                    <h3 className="text-lg font-medium text-blue-800 mb-2">
                      Nykyinen tilaus: {companyData.subscriptionStartDate || (companyData.subscriptionEndDate && new Date(companyData.subscriptionEndDate).getTime() > new Date().getTime()) || (companyData.trialEndDate && new Date(companyData.trialEndDate).getTime() > new Date().getTime()) ? "Premium" : "Free"}{companyData.trialEndDate && new Date(companyData.trialEndDate).getTime() > new Date().getTime() ? " (Kokeilujakso)" : ""}
                    </h3>
                    {companyData.trialEndDate && (
                      <>
                        <p className="text-blue-700">
                          Kokeilujakso päättyy: <span className="font-semibold">{formatDate(new Date(companyData.trialEndDate))}</span>
                        </p>
                        <p className="text-sm text-blue-600 mt-2">
                          Kokeilujakson päätyttyä tilauksesi muuttuu automaattisesti Free-tasolle. Voit milloin
                          tahansa päivittää tilauksesi Premium-tasoon.
                        </p>
                      </>)}
                    {companyData.subscriptionEndDate && (
                      <>
                        <p className="text-blue-700">
                          Tilausjakso päättyy: <span className="font-semibold">{formatDate(new Date(companyData.subscriptionEndDate))}</span>
                        </p>
                        <p className="text-sm text-blue-600 mt-2">
                          Kokeilujakson päätyttyä tilauksesi muuttuu automaattisesti Free-tasolle. Voit milloin
                          tahansa päivittää tilauksesi takaisin Premium-tasoon.
                        </p>
                      </>
                    )}

                  </div>

                  <Separator className="my-4" />
                  <h3 className="text-lg font-medium">Tilausvaihtoehdot</h3>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Free-taso */}
                    <div className="border rounded-lg p-6 relative">
                      <div className="absolute top-0 right-0 bg-gray-200 text-gray-800 px-3 py-1 rounded-bl-lg rounded-tr-lg text-sm font-medium">
                        Free
                      </div>
                      <h3 className="text-xl font-semibold mb-4">Free</h3>
                      <p className="text-2xl font-bold mb-6">
                        0,00 €<span className="text-sm font-normal text-gray-500">/kk</span>
                      </p>
                      <ul className="space-y-3 mb-6">
                        <li className="flex items-start">
                          <svg
                            className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            ></path>
                          </svg>
                          <span>Rajoitettu määrä käyttäjiä (1)</span>
                        </li>
                        <li className="flex items-start">
                          <svg
                            className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            ></path>
                          </svg>
                          <span>Perusominaisuudet</span>
                        </li>
                        <li className="flex items-start">
                          <svg
                            className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            ></path>
                          </svg>
                          <span>Rajoitettu määrä tilauksia (20/kk)</span>
                        </li>
                        <li className="flex items-start">
                          <svg
                            className="h-5 w-5 text-red-500 mr-2 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            ></path>
                          </svg>
                          <span className="text-gray-500">Ei edistyneitä raportteja</span>
                        </li>
                      </ul>
                      <Button onClick={() => switchSubscription("FREE")} variant="outline" className="w-full" disabled={companyData.subscriptionType === "FREE"}>
                        {companyData.subscriptionType === "FREE" ? "Nykyinen taso" : "Vaihda tilaukseen"}
                      </Button>
                    </div>

                    {/* Premium-taso */}
                    <div className="border border-blue-300 rounded-lg p-6 relative bg-blue-50">
                      <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 rounded-bl-lg rounded-tr-lg text-sm font-medium">
                        Premium
                      </div>
                      <h3 className="text-xl font-semibold mb-4">Premium</h3>
                      <p className="text-2xl font-bold mb-6">
                        49,90 €<span className="text-sm font-normal text-gray-500">/kk</span>
                      </p>
                      <ul className="space-y-3 mb-6">
                        <li className="flex items-start">
                          <svg
                            className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            ></path>
                          </svg>
                          <span>Rajoittamaton määrä käyttäjiä</span>
                        </li>
                        <li className="flex items-start">
                          <svg
                            className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            ></path>
                          </svg>
                          <span>Kaikki ominaisuudet</span>
                        </li>
                        <li className="flex items-start">
                          <svg
                            className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            ></path>
                          </svg>
                          <span>Rajoittamaton määrä tilauksia</span>
                        </li>
                        <li className="flex items-start">
                          <svg
                            className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            ></path>
                          </svg>
                          <span>Edistyneet raportit</span>
                        </li>
                      </ul>
                      <Button onClick={() => switchSubscription("PREMIUM")} className="w-full bg-blue-600 hover:bg-blue-700" disabled={companyData.subscriptionType === "PREMIUM"}>
                        {companyData.subscriptionType === "PREMIUM" ? "Nykyinen taso" : "Vaihda tilaukseen"}
                      </Button>
                    </div>
                  </div>

                  <Separator className="my-4" />
                  <h3 className="text-lg font-medium">Usein kysytyt kysymykset</h3>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Mitä tapahtuu kokeilujakson päätyttyä?</h4>
                      <p className="text-sm text-gray-600">
                        Kokeilujakson päätyttyä tilauksesi muuttuu automaattisesti Free-tasolle. Kaikki tietosi
                        säilyvät, mutta käytössäsi on vain Free-tason ominaisuudet. Voit milloin tahansa
                        päivittää tilauksesi takaisin Premium-tasolle.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Voinko perua tilaukseni milloin tahansa?</h4>
                      <p className="text-sm text-gray-600">
                        Kyllä, voit milloin tahansa vaihtaa Premium-tilauksesta Free-tasolle. Tilauksesi jatkuu
                        sen laskutuskauden loppuun, jonka olet jo maksanut.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Miten voin päivittää tilaukseni Premium-tasolle?</h4>
                      <p className="text-sm text-gray-600">
                        Voit päivittää tilauksesi Premium-tasolle milloin tahansa klikkaamalla "Jatka
                        Premium-tilausta" -painiketta. Tällä hetkellä maksutoimintoa ei ole vielä toteutettu,
                        joten ota yhteyttä asiakaspalveluumme päivitystä varten.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Peruuta</Button>
                <Button>Tallenna muutokset</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </SiikliPage>
    </>
  )
}

