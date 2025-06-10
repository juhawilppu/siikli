'use client'

import type React from 'react'

import type { GetCompanySettings, GetUsersResponseDto, PostCompanySettings, PostSubscriptionChangeRequest } from '@/types/types'
import axios from 'axios'

import { Save, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import SiikliPage from '@/SiikliPage'
import { formatDate } from '@/utils/date'
import ConfirmDialog from './ConfirmDialog'

export default function CompanySettings() {
  const [companyData, setCompanyData] = useState<GetCompanySettings>()
  const [users, setUsers] = useState<GetUsersResponseDto[]>()
  const [showDeleteCompanyModal, setShowDeleteCompanyModal] = useState(false)
  const [showSwitchSubscriptionModal, setShowSwitchSubscriptionModal] = useState<null | 'FREE' | 'PREMIUM'>(null)
  const { toast } = useToast()

  const handleDeleteCompany = async () => {
    await axios.delete('/tenants')
    await axios.post('/auth/logout')
    toast({
      title: 'Yritys poistettu',
      description: 'Yritys on poistettu onnistuneesti. Sinut ohjataan etusivulle.',
      variant: 'success',
    })
    setShowDeleteCompanyModal(false)
    setTimeout(() => {
      window.location.href = '/'
    }, 2000)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value }: { name: string, value: string } = e.target
    setCompanyData((prev) => {
      if (!prev)
        return prev
      return {
        ...prev,
        [name]: typeof prev[name as keyof GetCompanySettings] === 'string' ? value : Number(value),
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!companyData)
      return

    // Here you would typically save the data to your backend
    console.log('Saving company data:', companyData)
    const data: PostCompanySettings = {
      name: companyData.name,
      businessId: companyData.businessId,
      streetAddress: companyData.streetAddress,
      postalCode: companyData.postalCode,
      city: companyData.city,
      invoiceBankName: companyData.invoiceBankName,
      invoiceBankAccount: companyData.invoiceBankAccount,
      invoiceReference: companyData.invoiceReference,
      invoiceSumRow: companyData.invoiceSumRow,
      phone: companyData.phone,
      email: companyData.email,
      website: companyData.website,
    }
    await axios.post('/tenants', data)
    toast({
      title: 'Tiedot tallennettiin',
      description: 'Yrityksen tiedot tallennettiin onnistuneesti.',
      variant: 'success',
    })
  }

  const askSwitchSubscription = async (subscription: 'FREE' | 'PREMIUM') => {
    setShowSwitchSubscriptionModal(subscription)
  }

  const switchSubscription = async (subscription: 'FREE' | 'PREMIUM') => {
    setShowSwitchSubscriptionModal(null)
    const result = await axios.post<PostSubscriptionChangeRequest>('/tenants/subscription', {
      subscription,
    })
    toast({
      title: 'Tilausvaihto',
      description: 'Tilausvaihto onnistui',
      variant: 'success',
    })
    setCompanyData((prev) => {
      if (!prev)
        return prev
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
    const fetchData = async () => {
      const [companyResponse, usersResponse] = await Promise.all([
        axios.get<GetCompanySettings>(`/tenants`),
        axios.get<GetUsersResponseDto[]>(`/tenants/users`),
      ])
      setCompanyData(companyResponse.data)
      setUsers(usersResponse.data)
    }
    fetchData()
  }, [])

  if (!companyData || !users)
    return <SiikliPage title="Oma yritys" description="Voit hallinnoida yrityksesi asetuksia täällä" />

  return (
    <>
      <SiikliPage title="Oma yritys" description="Voit hallinnoida yrityksesi asetuksia täällä">

        <Tabs defaultValue="company" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="company">Yritys</TabsTrigger>
            <TabsTrigger value="users">Käyttäjät</TabsTrigger>
            <TabsTrigger value="subscription">Tilaus</TabsTrigger>
            <TabsTrigger value="others">Muut</TabsTrigger>
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
                        autoComplete="street-address"
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
                          autoComplete="postal-code"
                          value={companyData.postalCode || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="city">Kaupunki</Label>
                        <Input id="city" name="city" autoComplete="city" value={companyData.city || ''} onChange={handleInputChange} />
                      </div>
                    </div>

                    <Separator className="my-4" />
                    <h3 className="text-lg font-medium">Pankkitiedot</h3>
                    <CardDescription>
                      Pankkitietoja käytetään laskuissa.
                    </CardDescription>
                    <div className="space-y-2">
                      <Label htmlFor="invoice-bank-name">Pankin nimi</Label>
                      <Input
                        id="invoice-bank-name"
                        name="invoiceBankName"
                        value={companyData.invoiceBankName || ''}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="invoice-bank-account">Pankkitilin numero (IBAN)</Label>
                        <Input
                          id="invoice-bank-account"
                          name="invoiceBankAccount"
                          value={companyData.invoiceBankAccount || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nvoice-reference">SWIFT/BIC</Label>
                        <Input
                          id="invoice-reference"
                          name="invoiceReference"
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
                        <Input id="phone" name="phone" autoComplete="tel" value={companyData.phone || ''} onChange={handleInputChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Sähköposti</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
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
                <div className="space-y-4">
                  {users.map(user => (
                    <div key={user.id}>
                      <p>{user.email}</p>
                      <p>{user.role === 'OWNER' ? 'Omistaja' : 'Käyttäjä'}</p>
                      <p>{user.lastLoginAt ? formatDate(new Date(user.lastLoginAt)) : 'Ei kirjautunut sisään'}</p>
                    </div>
                  ))}
                </div>
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
                      Nykyinen tilaus:
                      {' '}
                      {companyData.subscriptionStartDate || (companyData.subscriptionEndDate && new Date(companyData.subscriptionEndDate).getTime() > new Date().getTime()) || (companyData.trialEndDate && new Date(companyData.trialEndDate).getTime() > new Date().getTime()) ? 'Premium' : 'Free'}
                      {companyData.trialEndDate && new Date(companyData.trialEndDate).getTime() > new Date().getTime() ? ' (Kokeilujakso)' : ''}
                    </h3>
                    {companyData.trialEndDate && (
                      <>
                        <p className="text-blue-700">
                          Kokeilujakso päättyy:
                          {' '}
                          <span className="font-semibold">{formatDate(new Date(companyData.trialEndDate))}</span>
                        </p>
                        <p className="text-sm text-blue-600 mt-2">
                          Kokeilujakson päätyttyä tilauksesi muuttuu automaattisesti Free-tasolle. Voit milloin
                          tahansa päivittää tilauksesi Premium-tasoon.
                        </p>
                      </>
                    )}
                    {companyData.subscriptionEndDate && (
                      <>
                        <p className="text-blue-700">
                          Tilausjakso päättyy:
                          {' '}
                          <span className="font-semibold">{formatDate(new Date(companyData.subscriptionEndDate))}</span>
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
                        0,00 €
                        <span className="text-sm font-normal text-gray-500">/kk</span>
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
                            >
                            </path>
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
                            >
                            </path>
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
                            >
                            </path>
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
                            >
                            </path>
                          </svg>
                          <span className="text-gray-500">Ei edistyneitä raportteja</span>
                        </li>
                      </ul>
                      <Button onClick={() => askSwitchSubscription('FREE')} variant="outline" className="w-full" disabled={companyData.subscriptionType === 'FREE'}>
                        {companyData.subscriptionType === 'FREE' ? 'Nykyinen taso' : 'Vaihda tilaukseen'}
                      </Button>
                    </div>

                    {/* Premium-taso */}
                    <div className="border border-blue-300 rounded-lg p-6 relative bg-blue-50">
                      <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 rounded-bl-lg rounded-tr-lg text-sm font-medium">
                        Premium
                      </div>
                      <h3 className="text-xl font-semibold mb-4">Premium</h3>
                      <p className="text-2xl font-bold mb-6">
                        49,90 €
                        <span className="text-sm font-normal text-gray-500">/kk</span>
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
                            >
                            </path>
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
                            >
                            </path>
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
                            >
                            </path>
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
                            >
                            </path>
                          </svg>
                          <span>Edistyneet raportit</span>
                        </li>
                      </ul>
                      <Button onClick={() => askSwitchSubscription('PREMIUM')} className="w-full bg-blue-600 hover:bg-blue-700" disabled={companyData.subscriptionType === 'PREMIUM'}>
                        {companyData.subscriptionType === 'PREMIUM' ? 'Nykyinen taso' : 'Vaihda tilaukseen'}
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
            </Card>
          </TabsContent>

          <TabsContent value="others">
            <Card>
              <CardHeader>
                <CardTitle>Muut</CardTitle>
                <CardDescription>Voit halutessasi poistaa yrityksesi ja käyttäjätilisi.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" onClick={() => setShowDeleteCompanyModal(true)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Poista yrityksen kaikki tiedot
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </SiikliPage>

      {showDeleteCompanyModal && (
        <ConfirmDialog
          title="Poista yritys"
          description="Oletko varma, että haluat poistaa yrityksen? Kaikki tiedot poistetaan, eikä niitä voi palauttaa."
          onConfirm={handleDeleteCompany}
          onCancel={() => setShowDeleteCompanyModal(false)}
        />
      )}

      {showSwitchSubscriptionModal && (
        <ConfirmDialog
          title="Vaihda tilaus"
          description={`Oletko varma, että haluat vaihtaa tilaukseen ${showSwitchSubscriptionModal === 'FREE' ? 'Free' : 'Premium'}?`}
          confirmText="Vaihda tilaustaso"
          onConfirm={() => switchSubscription(showSwitchSubscriptionModal)}
          onCancel={() => setShowSwitchSubscriptionModal(null)}
        />
      )}
    </>
  )
}
