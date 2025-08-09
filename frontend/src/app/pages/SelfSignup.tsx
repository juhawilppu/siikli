'use client'

import axios from 'axios'
import { Building2, Check, Info, Loader2, Rocket, Users } from 'lucide-react'

import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useToast } from '@/hooks/use-toast'

export default function SelfSignup() {
  const [companyNamy, setCompanyName] = useState('')
  const [businessId, setBusinessId] = useState('')
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { toast } = useToast()

  const handleSave = async () => {
    if (!companyNamy.trim()) {
      toast({
        title: 'Yrityksen nimi puuttuu',
        description: 'Syötä yrityksesi nimi jatkaaksesi.',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)

    try {
      const data = {
        name: companyNamy,
        businessId,
        user: {
          marketingConsent,
        },
      }

      await axios.post('/tenants/create', data)

      toast({
        title: 'Yritys perustettu onnistuneesti!',
        description: `${companyNamy} on nyt perustettu Siikli ERP -järjestelmään.`,
      })

      window.location.href = '/'
    }
    catch (e) {
      console.error('error', e)
      toast({
        title: 'Virhe yrityksen perustamisessa',
        description: 'Yritä uudelleen myöhemmin.',
        variant: 'destructive',
      })
    }
    finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    await axios.post('/auth/logout')
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-2xl text-primary">Siikli</span>
            <span className="text-sm font-medium text-muted-foreground">ERP</span>
          </div>
          <div className="flex items-center gap-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Peruuta
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Haluatko varmasti peruuttaa?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Jos peruutat nyt, yrityksen perustamistiedot eivät tallennu. Sinut kirjataan ulos järjestelmästä.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Jatka perustamista</AlertDialogCancel>
                  <AlertDialogAction onClick={() => logout()}>
                    Peruuta ja kirjaudu ulos
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </header>

      <main className="flex-1 py-12">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold tracking-tight mb-2">Tervetuloa Siikliin!</h1>
              <p className="text-muted-foreground">
                Huomasimme, että sinua ei ole vielä liitetty mihinkään yritykseen. Perustetaan yrityksesi nyt.
              </p>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Perusta yritys</CardTitle>
                <CardDescription className="text-gray-700">
                  Täytä tarvittavat tiedot yrityksesi perustamiseksi Siikli ERP -järjestelmään.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="yrityksen-nimi" className="font-medium">
                      Yrityksen nimi
                      {' '}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="yrityksen-nimi"
                      placeholder="Esim. Siikli Solutions Oy"
                      value={companyNamy}
                      onChange={e => setCompanyName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="ytunnus" className="font-medium">
                        Y-tunnus
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Voit lisätä Y-tunnuksen myöhemmin, jos se ei ole vielä tiedossa.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Input
                      id="ytunnus"
                      placeholder="Esim. 1234567-8"
                      value={businessId}
                      onChange={e => setBusinessId(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-4">
                    <Checkbox
                      id="markkinointilupa"
                      checked={marketingConsent}
                      onCheckedChange={checked => setMarketingConsent(checked as boolean)}
                    />
                    <Label htmlFor="markkinointilupa" className="text-sm">
                      Haluan vastaanottaa tietoa Siikli ERP:n uusista ominaisuuksista ja päivityksistä
                    </Label>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSave} disabled={isLoading || !companyNamy.trim()}>
                    {isLoading
                      ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Perustetaan...
                          </>
                        )
                      : (
                          <>
                            <Rocket className="mr-2 h-4 w-4" />
                            Perusta yritys
                          </>
                        )}
                  </Button>
                </div>
              </CardContent>

            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Siikli ERP:n hyödyt</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {[
                      'Hallitse tilauksia, asiakkaita ja tuotteita yhdessä paikassa',
                      'Automatisoi laskutus ja seuraa maksuja',
                      'Optimoi kuljetukset ja toimitukset',
                      'Seuraa liiketoimintasi kehitystä reaaliajassa',
                      'Säästä aikaa ja vähennä virheitä',
                    ].map((hyoty, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{hyoty}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Vinkkejä alkuun pääsemiseksi</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-3 list-decimal pl-5">
                    {[
                      'Lisää yrityksesi perustiedot ja logo asetuksissa',
                      'Kutsu tiimisi jäsenet käyttämään järjestelmää',
                      'Lisää tuotteet ja palvelut tuotehallinnassa',
                      'Tuo asiakastiedot tai lisää ensimmäiset asiakkaat',
                      'Tutustu raportteihin ja analytiikkaan',
                    ].map((vinkki, index) => (
                      <li key={index} className="text-sm pl-1">
                        {vinkki}
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-6">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              <p>© 2025 Siikli. Kaikki oikeudet pidätetään.</p>
            </div>
            <div className="flex gap-6">
              <NavLink to="#tuki" className="text-sm text-muted-foreground hover:text-foreground">
                Tuki
              </NavLink>
              <NavLink to="#tietosuoja" className="text-sm text-muted-foreground hover:text-foreground">
                Tietosuoja
              </NavLink>
              <NavLink to="#kayttoehdot" className="text-sm text-muted-foreground hover:text-foreground">
                Käyttöehdot
              </NavLink>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
