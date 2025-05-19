import { ArrowRight, BarChart3, Box, Check, ChevronRight, FileText, Package, Truck, Users } from 'lucide-react'

import { useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Footer from './Footer'
import TopBar from './TopBar'
import { useTranslation } from './translations'
import UiCarousel from './UiCarousel'

export default function LandingPage() {
  const t = useTranslation('fi')

  const pricingRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const ordersRef = useRef<HTMLDivElement>(null)
  const customersRef = useRef<HTMLDivElement>(null)
  const productsRef = useRef<HTMLDivElement>(null)
  const invoicesRef = useRef<HTMLDivElement>(null)
  const shippingRef = useRef<HTMLDivElement>(null)
  const reportsRef = useRef<HTMLDivElement>(null)

  const scrollToPricing = () => {
    pricingRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToOrders = () => {
    ordersRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToCustomers = () => {
    customersRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToProducts = () => {
    productsRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToInvoices = () => {
    invoicesRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToShipping = () => {
    shippingRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToReports = () => {
    reportsRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (window.location.hash === '#hinnoittelu') {
      scrollToPricing()
    }
    else if (window.location.hash === '#ominaisuudet') {
      scrollToFeatures()
    }
    else if (window.location.hash === '#tilaukset') {
      scrollToOrders()
    }
    else if (window.location.hash === '#asiakashallinta') {
      scrollToCustomers()
    }
    else if (window.location.hash === '#tuotehallinta') {
      scrollToProducts()
    }
    else if (window.location.hash === '#laskutus') {
      scrollToInvoices()
    }
    else if (window.location.hash === '#kuljetukset') {
      scrollToShipping()
    }
    else if (window.location.hash === '#raportit') {
      scrollToReports()
    }
  }, [window.location.hash])

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />

      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-50">
        <div className="container px-4 md:px-6 flex flex-col md:flex-row items-center md:items-start gap-12">
          <div className="flex flex-col gap-4 md:w-1/2">
            <img src="/siikli-logo.png" alt="Siikli Logo" className="w-1/3" />
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              {t('landing.title')}
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl">
              Siikli on helppokäyttöinen toiminnanohjausjärjestelmä, joka on suunniteltu erityisesti suomalaisten
              pienyritysten tarpeisiin.
            </p>
            <p className="text-muted-foreground text-lg md:text-xl">
              🎉 Ensimmäiset käyttäjät saavat 3 kuukautta täysin ilmaiseksi. Haen palautetta ja kehityskohteita – saat täyden version maksutta ja autat samalla tekemään siitä entistä paremman.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Button size="lg" className="rounded-full" asChild>
                <NavLink to="/kirjaudu">
                  Aloita ilmaiseksi
                  {' '}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </NavLink>
              </Button>
              <Button variant="outline" size="lg" className="rounded-full" asChild>
                <a href="#ominaisuudet">Tutustu ominaisuuksiin</a>
              </Button>
            </div>
            {false && (
              <div className="flex items-center gap-2 mt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className="h-8 w-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-medium"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Yli
                  {' '}
                  <span className="font-medium">500+</span>
                  {' '}
                  yritystä käyttää Siikliä
                </p>
              </div>
            )}
          </div>
          <div className="w-full md:w-1/2">
            <UiCarousel />
          </div>

        </div>
      </section>

      <section className="w-full py-12 md:py-24 bg-white" id="ominaisuudet" ref={featuresRef}>
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center gap-4 text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Kaikki mitä tarvitset liiketoimintasi hallintaan</h2>
            <p className="text-muted-foreground text-lg max-w-[800px]">
              Siikli tarjoaa kattavat työkalut yrityksesi toiminnan tehostamiseen ja hallintaan.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card ref={ordersRef} className="rounded-xl border p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Tilausten hallinta</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Hallitse tilauksia helposti, seuraa toimituksia ja pidä asiakkaat ajan tasalla.
                </p>
                <ul className="mt-4 space-y-2">
                  {['Tilausten luonti', 'Pakkauskoot', 'Huomautukset ja kommentit'].map(
                    feature => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ),
                  )}
                </ul>
              </CardContent>
              {false && (
                <CardFooter>
                  <Button variant="ghost" size="sm" className="gap-1" asChild>
                    <a href="#tilaukset">
                      Lue lisää
                      {' '}
                      <ChevronRight className="h-4 w-4" />
                    </a>
                  </Button>
                </CardFooter>
              )}
            </Card>
            <Card ref={customersRef} className="rounded-xl border p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Asiakashallinta</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Pidä asiakastiedot järjestyksessä ja paranna asiakaspalvelua.</p>
                <ul className="mt-4 space-y-2">
                  {['Kattavat asiakasprofiilit', 'Asiakasryhmittely', 'Tilaushistoria'].map(feature => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              {false && (
                <CardFooter>
                  <Button variant="ghost" size="sm" className="gap-1" asChild>
                    <a href="#asiakkaat">
                      Lue lisää
                      {' '}
                      <ChevronRight className="h-4 w-4" />
                    </a>
                  </Button>
                </CardFooter>
              )}
            </Card>
            <Card ref={productsRef} className="rounded-xl border p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Box className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Tuotehallinta</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Hallitse tuotevalikoimaa ja hintoja tehokkaasti.
                </p>
                <ul className="mt-4 space-y-2">
                  {['Tuoteryhmien hallinta', 'Hinnoittelu', 'Muokkaus'].map(feature => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              {false && (
                <CardFooter>
                  <Button variant="ghost" size="sm" className="gap-1" asChild>
                    <a href="#tuotteet">
                      Lue lisää
                      {' '}
                      <ChevronRight className="h-4 w-4" />
                    </a>
                  </Button>
                </CardFooter>
              )}
            </Card>
            <Card ref={invoicesRef} className="rounded-xl border p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Laskutus</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Luo ja lähetä laskuja.</p>
                <ul className="mt-4 space-y-2">
                  {['Laskujen luonti', 'Massatoiminnot', 'Tulostettava PDF'].map(feature => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              {false && (
                <CardFooter>
                  <Button variant="ghost" size="sm" className="gap-1" asChild>
                    <a href="#laskutus">
                      Lue lisää
                      {' '}
                      <ChevronRight className="h-4 w-4" />
                    </a>
                  </Button>
                </CardFooter>
              )}
            </Card>
            <Card ref={shippingRef} className="rounded-xl border p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Kuormakirjat</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Suunnittele kuljetukset tehokkaasti ja seuraa toimituksia.</p>
                <ul className="mt-4 space-y-2">
                  {['Hyväksyttävä formaatti', 'Massatulostus', 'Selkeä käyttöliittymä'].map(
                    feature => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ),
                  )}
                </ul>
              </CardContent>
              {false && (
                <CardFooter>
                  <Button variant="ghost" size="sm" className="gap-1" asChild>
                    <a href="#kuljetukset">
                      Lue lisää
                      {' '}
                      <ChevronRight className="h-4 w-4" />
                    </a>
                  </Button>
                </CardFooter>
              )}
            </Card>
            <Card ref={reportsRef} className="rounded-xl border p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Raportit</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Seuraa liiketoimintasi kehitystä kattavien raporttien avulla.</p>
                <ul className="mt-4 space-y-2">
                  {['Myyntiraportit', 'Vie Exceliin', 'Kattavat raportit'].map(feature => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              {false && (
                <CardFooter>
                  <Button variant="ghost" size="sm" className="gap-1" asChild>
                    <a href="#raportit">
                      Lue lisää
                      {' '}
                      <ChevronRight className="h-4 w-4" />
                    </a>
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 bg-gray-50" id="hinnoittelu" ref={pricingRef}>
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center gap-4 text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Selkeä hinnoittelu ilman yllätyksiä</h2>
            <p className="text-muted-foreground text-lg max-w-[800px]">
              Aloita ilmaiseksi ja päivitä tarvittaessa &ndash; maksat vain jos saat hyötyä.
            </p>
          </div>
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-border flex flex-col">
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <CardDescription>Pienille yrityksille, joilla on yksinkertaiset tarpeet</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">0 €</span>
                  <span className="text-muted-foreground">/kk</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2">
                  {['1 käyttäjä', 'Asiakas- ja tuotehallinta', 'Tilausten hallinta', 'Perusraportit', 'Ei luottokorttia, ei aikarajaa'].map(
                    feature => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ),
                  )}
                </ul>
                <p className="text-muted-foreground mt-4">🎉 Sisältää myös 3 kk kokeilun kaikilla ominaisuuksilla</p>
              </CardContent>
              <CardFooter>
                <Button className="w-full">👉 Aloita heti ilman maksua</Button>
              </CardFooter>
            </Card>
            <Card className="border-primary relative border-border flex flex-col">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-white text-xs font-medium px-3 py-1 rounded-full">
                Suositeltu taso
              </div>
              <CardHeader>
                <CardTitle>Premium</CardTitle>
                <CardDescription>Kasvaville yrityksille, jotka haluavat mukaan laskutuksen ja tuen</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">49 €</span>
                  <span className="text-muted-foreground">/kk</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2">
                  {[
                    '5 käyttäjää',
                    'Laskutus',
                    'Kuljetusten hallinta',
                    'Edistyneet raportit',
                    'Sähköposti- ja puhelintuki',
                    'Kaikki ominaisuudet',
                  ].map(feature => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full">👉 Aloita 3 kk kokeilu</Button>
              </CardFooter>
            </Card>
          </div>
          <p className="text-sm text-muted-foreground mt-4 text-center">Hinnat ALV 0 %. Palvelu on tarkoitettu yrityskäyttöön.</p>
        </div>
      </section>

      {false && (
        <section className="w-full py-12 md:py-24 bg-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center gap-4 text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight">Mitä asiakkaamme sanovat</h2>
              <p className="text-muted-foreground text-lg max-w-[800px]">
                Tuhannet yritykset ovat tehostaneet toimintaansa Siikli ERP:n avulla.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  name: 'xxx',
                  company: 'xxx',
                  quote:
                    'xxx',
                },
                {
                  name: 'xxx',
                  company: 'xxx',
                  quote:
                    'xxx',
                },
                {
                  name: 'xxx',
                  company: 'xxx',
                  quote:
                    'xxx',
                },
              ].map((testimonial, i) => (
                <Card key={i} className="bg-gray-50 border-none">
                  <CardContent className="pt-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <svg
                            key={star}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-5 h-5 text-yellow-500"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ))}
                      </div>
                      <p className="text-muted-foreground italic">
                        "
                        {testimonial.quote}
                        "
                      </p>
                      <div className="flex items-center gap-4 mt-4">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                          {testimonial.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{testimonial.name}</p>
                          <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="w-full py-12 md:py-24 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center gap-4 md:gap-8">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Valmis tehostamaan liiketoimintaasi?</h2>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-[800px]">
              Aloita Siikli ERP:n käyttö jo tänään ja näe ero yrityksesi toiminnassa.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Button size="lg" variant="secondary" asChild>
                <NavLink to="/kirjaudu">
                  Aloita ilmainen 3 kk kokeilu
                  {' '}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </NavLink>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
                asChild
              >
                <NavLink to="/yhteystiedot">Kysy lisätietoja</NavLink>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Turvallisuus */}
      <section className="w-full py-12 md:py-24 bg-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2 flex flex-col gap-4">
              <h2 className="text-3xl font-bold tracking-tight">Tietosi ovat turvassa</h2>
              <p className="text-muted-foreground text-lg">
                Siikli ERP on rakennettu alusta alkaen tietoturva edellä. Kaikki data on salattua ja säilytetään EU:n alueella GDPR-säädösten mukaisesti. Järjestelmässä sovelletaan käytäntöjä, joita olen oppinut toimiessani tietoturvavastaavana päivittäisessä työssäni ohjelmistokehityksen parissa.
              </p>
              <ul className="mt-4 space-y-2">
                {[
                  '256-bittinen salaus kaikelle datalle',
                  'Automaattiset varmuuskopiot',
                  'GDPR-yhteensopiva',
                  'Tietoturvaa ylläpitää kokenut asiantuntija',
                ].map(feature => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:w-1/3 flex justify-center">
              <div className="md:w-1/2 max-w-md aspect-video rounded-lg flex items-center justify-center">
                <img src="/shield.svg" alt="Tietoturva" className="rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
