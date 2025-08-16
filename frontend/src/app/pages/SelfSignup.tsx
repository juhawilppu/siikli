'use client'

import axios from 'axios'
import { Building2, Check, Loader2, Rocket, Users } from 'lucide-react'

import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useToast } from '@/app/hooks/use-toast'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SelfSignup() {
  const [companyNamy, setCompanyName] = useState('')
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
        user: {
          marketingConsent,
        },
      }

      await axios.post('/tenants/create', data)

      window.location.href = '/app'
    }
    catch (e) {
      console.error('error', e)
      setIsLoading(false)
      toast({
        title: 'Virhe käyttöönottossa',
        description: 'Yritä uudelleen myöhemmin.',
        variant: 'destructive',
      })
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
                    Sinut kirjataan ulos järjestelmästä.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Jatka</AlertDialogCancel>
                  <AlertDialogAction onClick={() => logout()}>
                    Kirjaudu ulos
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
                Lisätään yrityksesi tiedot.
              </p>
            </div>

            <Card className="mb-8">
              <CardContent>
                <div className="space-y-4 mt-4">
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

                  <div className="flex items-center space-x-2 pt-4">
                    <Checkbox
                      id="markkinointilupa"
                      checked={marketingConsent}
                      onCheckedChange={checked => setMarketingConsent(checked as boolean)}
                    />
                    <Label htmlFor="markkinointilupa" className="text-sm">
                      Haluan vastaanottaa tietoa Siiklin uusista ominaisuuksista ja päivityksistä
                    </Label>
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <Button onClick={handleSave} disabled={isLoading || !companyNamy.trim()}>
                    {isLoading
                      ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Ladataan...
                            {' '}
                          </>
                        )
                      : (
                          <>
                            <Rocket className="mr-2 h-4 w-4" />
                            Jatka
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
                    <CardTitle className="text-lg">Siiklin hyödyt</CardTitle>
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
