'use client'

import type { GetCompanySettings, GetUsersResponseDto, PostCompanySettings, PostSubscriptionChangeRequest } from '@siikli/shared'

import type React from 'react'
import { formatDate } from '@siikli/shared'

import axios from 'axios'
import { Pencil, Save, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import SiikliPage from '@/app/components/SiikliPage'
import { useToast } from '@/app/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ConfirmDialog from '../components/ConfirmDialog'
import { Checkmark } from '../components/custom-icons'
import { InfoTooltip } from '../components/info-tooltip'
import { useAuth } from '../context/AuthContext'

export default function CompanySettings() {
  const { user } = useAuth()
  const [companyData, setCompanyData] = useState<GetCompanySettings>()
  const [users, setUsers] = useState<GetUsersResponseDto[]>()
  const [showDeleteCompanyModal, setShowDeleteCompanyModal] = useState(false)
  const [showSwitchSubscriptionModal, setShowSwitchSubscriptionModal] = useState<null | 'FREE' | 'PREMIUM'>(null)
  const [showDeleteUserModal, setShowDeleteUserModal] = useState<null | string>(null)
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [showEditUserModal, setShowEditUserModal] = useState<GetUsersResponseDto | null>(null)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('USER')
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const handleDeleteCompany = async () => {
    try {
      setIsSaving(true)
      await axios.delete('/tenants')
      toast({
        title: 'Yritys poistettu',
        description: 'Yritys on poistettu onnistuneesti. Sinut ohjataan etusivulle.',
        variant: 'success',
      })
      setShowDeleteCompanyModal(false)
      setTimeout(() => {
        // User session is already invalid on the server, just redirect
        window.location.href = '/'
      }, 2000)
    }
    catch (error) {
      console.error(error)
      toast({
        title: 'Yrityksen poistaminen epäonnistui',
        description: 'Yrityksen poistaminen epäonnistui.',
        variant: 'destructive',
      })
    }
    finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value }: { name: string, value: string } = e.currentTarget
    setCompanyData((prev) => {
      if (!prev)
        return prev
      return {
        ...prev,
        [name]: value,
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!companyData)
      return

    const data: PostCompanySettings = {
      name: companyData.name,
      businessId: companyData.businessId,
      streetAddress: companyData.streetAddress,
      postalCode: companyData.postalCode,
      city: companyData.city,
      invoiceBankName: companyData.invoiceBankName,
      invoiceBankAccount: companyData.invoiceBankAccount,
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
    try {
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
    catch (error) {
      console.error(error)
      toast({
        title: 'Tilausvaihto epäonnistui',
        description: 'Tilausvaihto epäonnistui.',
        variant: 'destructive',
      })
    }
    finally {
      setIsSaving(false)
    }
  }

  const deleteUser = async (userId: string) => {
    try {
      setIsSaving(true)
      setShowDeleteUserModal(null)
      await axios.delete(`/tenants/users/${userId}`)
      toast({
        title: 'Käyttäjä poistettu',
        description: 'Käyttäjä on poistettu onnistuneesti.',
      })
      setUsers(prev => prev?.filter(user => user.id !== userId))
    }
    catch (error) {
      console.error(error)
      toast({
        title: 'Käyttäjän poistaminen epäonnistui',
        description: 'Käyttäjän poistaminen epäonnistui.',
        variant: 'destructive',
      })
    }
    finally {
      setIsSaving(false)
    }
  }

  const addUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      setIsSaving(true)
      await axios.post('/tenants/users', { email, role })
      const usersResponse = await axios.get<GetUsersResponseDto[]>(`/tenants/users`)
      setUsers(usersResponse.data)
      setShowAddUserModal(false)
      setEmail('')
      setRole('USER')
      toast({
        title: 'Käyttäjä lisätty',
        description: 'Käyttäjä on lisätty onnistuneesti.',
        variant: 'success',
      })
    }
    catch (error) {
      console.error(error)
      toast({
        title: 'Käyttäjän lisääminen epäonnistui',
        description: 'Käyttäjän lisääminen epäonnistui. Tarkista sähköposti ja rooli.',
        variant: 'destructive',
      })
    }
    finally {
      setIsSaving(false)
    }
  }

  const editUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!showEditUserModal)
      return
    try {
      setIsSaving(true)
      await axios.put(`/tenants/users/${showEditUserModal.id}`, { role: showEditUserModal.role })
      toast({
        title: 'Käyttäjän rooli muutettu',
        description: 'Käyttäjän rooli muutettu onnistuneesti.',
        variant: 'success',
      })
      setUsers(prev => prev?.map(user => user.id === showEditUserModal.id ? { ...user, role: showEditUserModal.role } : user))
      setShowEditUserModal(null)
    }
    catch (error) {
      console.error(error)
      toast({
        title: 'Muokkaus epäonnistui',
        description: 'Muokkaus epäonnistui. Tarkista käyttäjän rooli.',
        variant: 'destructive',
      })
    }
    finally {
      setIsSaving(false)
    }
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

  if (!companyData || !users || !user)
    return <SiikliPage title="Oma yritys" description="Voit hallinnoida yrityksesi asetuksia täällä" />

  const free = companyData.subscriptionType === 'FREE'
  const trial = companyData.subscriptionType === 'PREMIUM' && companyData.trialEndDate && new Date(companyData.trialEndDate) > new Date()
  const premium = companyData.subscriptionType === 'PREMIUM' && !trial && (!companyData.subscriptionEndDate || new Date(companyData.subscriptionEndDate) > new Date())

  const subscriptionType = trial ? 'Free (1 kk koejakso)' : premium ? 'Premium' : free ? 'Free' : 'Ei tilaus'

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
                  <CardDescription className="text-gray-700">
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
                    <h3 className="text-lg font-medium">Laskutustiedot</h3>
                    <CardDescription className="text-gray-700">
                      Näytä tietoja käytetään laskuissa.
                    </CardDescription>
                    <div className="space-y-2">
                      <Label htmlFor="invoice-bank-account">
                        Pankkitilin numero (IBAN)
                        <InfoTooltip>Yrityksesi pankkitilin numero, joka näytetään laskuissa. Asiakas maksaa laskun tälle pankkitilille.</InfoTooltip>
                      </Label>
                      <Input
                        id="invoice-bank-account"
                        name="invoiceBankAccount"
                        value={companyData.invoiceBankAccount || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invoice-bank-name">
                        Pankin nimi
                        <InfoTooltip>Yrityksesi pankin nimi, joka näytetään laskuissa.</InfoTooltip>
                      </Label>
                      <Input
                        id="invoice-bank-name"
                        name="invoiceBankName"
                        value={companyData.invoiceBankName || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invoice-summary-row">
                        Laskun yhteenvetorivi
                        <InfoTooltip>
                          Yhteenvetorivi näytetään laskun etusivulla. Tämän lisäksi laskulla on myös liite, joka erittelee laskun tarkan sisällön.
                        </InfoTooltip>
                      </Label>
                      <Input
                        id="invoice-summary-row"
                        name="invoiceSumRow"
                        value={companyData.invoiceSumRow}
                        onChange={handleInputChange}
                      />
                    </div>

                    <Separator className="my-4" />
                    <h3 className="text-lg font-medium">Yhteystiedot</h3>
                    <CardDescription className="text-gray-700">
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
                <CardDescription className="text-gray-700">Hallitse käyttäjiä ja oikeuksia</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {user.authenticated && user.role === 'OWNER' && (
                    <Button disabled={companyData.subscriptionType === 'FREE'} onClick={() => setShowAddUserModal(true)}>
                      Lisää käyttäjä
                      {companyData.subscriptionType === 'FREE' ? ' (Premium-ominaisuus)' : ''}
                    </Button>
                  )}
                  <div className="space-y-4">
                    {users.map(u => (
                      <div key={u.id} className="border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-8 flex-1">
                          <div className="w-full sm:w-auto">
                            <label className="text-xs font-medium text-gray-500">Sähköposti</label>
                            <div className="text-sm font-medium text-muted-foreground break-words">{u.email}</div>
                          </div>
                          <div className="text-left sm:text-center w-full sm:w-1/2">
                            <label className="text-xs font-medium text-gray-500">Rooli</label>
                            <div>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                u.role === 'OWNER' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                              }`}
                              >
                                {u.role === 'OWNER' ? 'Omistaja' : 'Käyttäjä'}
                              </span>
                            </div>
                          </div>
                          <div className="w-full sm:w-1/3">
                            <label className="text-xs font-medium text-gray-500">Viimeisin kirjautuminen</label>
                            <div className="text-sm text-gray-500">
                              {u.lastLoginAt ? formatDate(new Date(u.lastLoginAt)) : 'Ei ole kirjautunut sisään'}
                            </div>
                          </div>
                        </div>
                        {user.authenticated && user.role === 'OWNER' && companyData.subscriptionType === 'PREMIUM' && (
                          <div className="flex space-x-1 self-start sm:self-center">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={u.id === user.userId}
                              onClick={() => {
                                setShowEditUserModal(u)
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={u.id === user.userId}
                              onClick={() => {
                                setShowDeleteUserModal(u.id)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription">
            <Card>
              <CardHeader>
                <CardTitle>Tilaustiedot</CardTitle>
                <CardDescription className="text-gray-700">Hallitse Siikli tilaustasi ja näe tilauksesi tila.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                    <h3 className="text-lg font-medium text-blue-800 mb-2">
                      Nykyinen tilaus:
                      {' '}
                      {subscriptionType}
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
                          <Checkmark />
                          <span>Kaikki ominaisuudet</span>
                        </li>
                        <li className="flex items-start">
                          <Checkmark />
                          <span>Rajoitettu määrä käyttäjiä (1)</span>
                        </li>
                        <li className="flex items-start">
                          <Checkmark />
                          <span>Rajoitettu määrä tilauksia (20/kk)</span>
                        </li>
                      </ul>
                      <Button onClick={() => askSwitchSubscription('FREE')} variant="outline" className="w-full" disabled={subscriptionType === 'Free' || subscriptionType === 'Free (1 kk koejakso)'}>
                        {subscriptionType === 'Free' || subscriptionType === 'Free (1 kk koejakso)' ? 'Nykyinen taso' : 'Vaihda taso'}
                      </Button>
                    </div>

                    {/* Premium-taso */}
                    <div className="border border-blue-300 rounded-lg p-6 relative bg-blue-50">
                      <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 rounded-bl-lg rounded-tr-lg text-sm font-medium">
                        Premium
                      </div>
                      <h3 className="text-xl font-semibold mb-4">Premium</h3>
                      <p className="text-2xl font-bold mb-6">
                        49,00 €
                        <span className="text-sm font-normal text-gray-500">/kk</span>
                      </p>
                      <ul className="space-y-3 mb-6">
                        <li className="flex items-start">
                          <Checkmark />
                          <span>Kaikki ominaisuudet</span>
                        </li>
                        <li className="flex items-start">
                          <Checkmark />
                          <span>Rajoittamaton määrä käyttäjiä</span>
                        </li>
                        <li className="flex items-start">
                          <Checkmark />
                          <span>Rajoittamaton määrä tilauksia</span>
                        </li>
                      </ul>
                      <Button onClick={() => askSwitchSubscription('PREMIUM')} className="w-full bg-blue-600 hover:bg-blue-700" disabled={subscriptionType === 'Premium'}>
                        {subscriptionType === 'Premium' ? 'Nykyinen taso' : 'Vaihda taso'}
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
                <CardDescription className="text-gray-700">Voit halutessasi poistaa yrityksesi ja käyttäjätilisi.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" onClick={() => setShowDeleteCompanyModal(true)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Poista kaikki tiedot
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
          isSaving={isSaving}
        />
      )}

      {showSwitchSubscriptionModal && (
        <ConfirmDialog
          isSaving={isSaving}
          title="Vaihda tilaus"
          description={`Oletko varma, että haluat vaihtaa tilaukseen ${showSwitchSubscriptionModal === 'FREE' ? 'Free' : 'Premium'}?`}
          confirmText="Vaihda tilaustaso"
          onConfirm={() => switchSubscription(showSwitchSubscriptionModal)}
          onCancel={() => setShowSwitchSubscriptionModal(null)}
        />
      )}

      {showDeleteUserModal && (
        <ConfirmDialog
          isSaving={isSaving}
          title="Poista käyttäjä"
          description={`Oletko varma, että haluat poistaa käyttäjän ${users?.find(u => u.id === showDeleteUserModal)?.email}?`}
          onConfirm={() => deleteUser(showDeleteUserModal)}
          onCancel={() => setShowDeleteUserModal(null)}
        />
      )}

      {showAddUserModal && (
        <Dialog open={showAddUserModal} onOpenChange={setShowAddUserModal}>
          <DialogContent className="sm:max-w-md w-full h-full sm:h-auto">
            <DialogHeader>
              <DialogTitle>Lisää käyttäjä</DialogTitle>
              <DialogDescription>
                <form onSubmit={addUser}>
                  <div className="space-y-4 mt-4 mb-4">
                    <div>
                      <Label htmlFor="email">Sähköposti</Label>
                      <Input
                        type="email"
                        placeholder="Käyttäjän sähköposti"
                        name="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">Rooli</Label>
                      <Select
                        name="role"
                        value={role}
                        onValueChange={value => setRole(value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Valitse rooli" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USER">Käyttäjä</SelectItem>
                          <SelectItem value="OWNER">Omistaja</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddUserModal(false)} className="hidden sm:block">Peruuta</Button>
                    <Button type="submit" disabled={isSaving}>Lisää käyttäjä</Button>
                  </DialogFooter>
                </form>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )}

      {showEditUserModal && (
        <Dialog open={!!showEditUserModal} onOpenChange={() => setShowEditUserModal(null)}>
          <DialogContent className="sm:max-w-md w-full h-full sm:h-auto">
            <DialogHeader>
              <DialogTitle>Muuta käyttäjän roolia</DialogTitle>
              <DialogDescription>
                <form onSubmit={editUser}>

                  <div className="space-y-4 mt-4 mb-4">
                    <div>
                      <Label htmlFor="name">Sähköposti</Label>
                      <Input
                        name="name"
                        readOnly
                        disabled
                        value={showEditUserModal.email}
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">Rooli</Label>
                      <Select
                        name="role"
                        value={showEditUserModal.role}
                        onValueChange={value => setShowEditUserModal({ ...showEditUserModal, role: value as 'USER' | 'OWNER' })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Valitse rooli" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USER">Käyttäjä</SelectItem>
                          <SelectItem value="OWNER">Omistaja</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowEditUserModal(null)} className="hidden sm:block">Peruuta</Button>
                    <Button type="submit" disabled={isSaving}>Tallenna</Button>
                  </DialogFooter>
                </form>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
