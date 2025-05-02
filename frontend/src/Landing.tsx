import { ArrowRight, BarChart3, Box, Check, ChevronRight, FileText, Package, Shield, Truck, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import LoginForm from "./LoginForm"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 pl-6">
            <span className="font-bold text-2xl text-primary">Siikli</span>
            <span className="text-sm font-medium text-muted-foreground">ERP</span>
          </div>
          <nav className="hidden md:flex gap-6 items-center">
            <a
              href="#ominaisuudet"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Ominaisuudet
            </a>
            <a
              href="#hinnoittelu"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Hinnoittelu
            </a>
            <a
              href="#tuki"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Tuki
            </a>
            <a
              href="#yhteystiedot"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Yhteystiedot
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <a href="#demo">Kokeile demoa</a>
            </Button>
            <Button size="sm" asChild>
              <a href="#kirjaudu">Kirjaudu sisään</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero-osio */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-50">
        <div className="container px-4 md:px-6 flex flex-col md:flex-row items-center gap-8">
          <div className="flex flex-col gap-4 md:w-1/2">
            <img src="/siikli-logo.png" alt="Siikli Logo" className="w-1/3" />
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              Hallitse liiketoimintaasi tehokkaasti Siikli ERP:llä
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl">
              Siikli on helppokäyttöinen toiminnanohjausjärjestelmä, joka on suunniteltu erityisesti suomalaisten
              pienyritysten tarpeisiin.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Button size="lg" asChild>
                <a href="#kirjaudu">
                  Aloita ilmaiseksi <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="#demo">Katso esittely</a>
              </Button>
            </div>
            {false && (
              <div className="flex items-center gap-2 mt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-8 w-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-medium"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Yli <span className="font-medium">500+</span> yritystä käyttää Siikliä
                </p>
              </div>
            )}
          </div>
          <div className="md:w-1/2" id="kirjaudu">
            <Card className="w-full max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Kirjaudu Siikliin</CardTitle>
                <CardDescription>Valitse kirjautumistapa ja pääset heti käyttämään järjestelmää</CardDescription>
              </CardHeader>
              <CardContent>
                <LoginForm />
              </CardContent>
              <CardFooter className="flex flex-col items-start gap-2">
                <div className="text-sm text-muted-foreground">
                  Eikö sinulla ole vielä tunnuksia?{" "}
                  <a href="#rekisteroidy" className="font-medium text-primary hover:underline">
                    Rekisteröidy nyt
                  </a>
                </div>
                <div className="text-xs text-muted-foreground">
                  Kirjautumalla hyväksyt{" "}
                  <a href="#kayttoehdot" className="text-primary hover:underline">
                    käyttöehdot
                  </a>{" "}
                  ja{" "}
                  <a href="#tietosuoja" className="text-primary hover:underline">
                    tietosuojakäytännön
                  </a>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Ominaisuudet */}
      <section className="w-full py-12 md:py-24 bg-white" id="ominaisuudet">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center gap-4 text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Kaikki mitä tarvitset liiketoimintasi hallintaan</h2>
            <p className="text-muted-foreground text-lg max-w-[800px]">
              Siikli tarjoaa kattavat työkalut yrityksesi toiminnan tehostamiseen ja hallintaan.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
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
                  {["Tilausten luonti ja seuranta", "Toimitusaikojen hallinta", "Automaattiset tilausvahvistukset"].map(
                    (feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ),
                  )}
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="gap-1" asChild>
                  <a href="#tilaukset">
                    Lue lisää <ChevronRight className="h-4 w-4" />
                  </a>
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Asiakashallinta</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Pidä asiakastiedot järjestyksessä ja paranna asiakaspalvelua.</p>
                <ul className="mt-4 space-y-2">
                  {["Kattavat asiakasprofiilit", "Asiakasryhmittely", "Tilaushistoria"].map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="gap-1" asChild>
                  <a href="#asiakkaat">
                    Lue lisää <ChevronRight className="h-4 w-4" />
                  </a>
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Box className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Tuotehallinta</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Hallitse tuotevalikoimaa, hintoja ja varastosaldoja tehokkaasti.
                </p>
                <ul className="mt-4 space-y-2">
                  {["Tuoteryhmien hallinta", "Hinnoittelu", "Varastosaldojen seuranta"].map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="gap-1" asChild>
                  <a href="#tuotteet">
                    Lue lisää <ChevronRight className="h-4 w-4" />
                  </a>
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Laskutus</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Luo ja lähetä laskuja automaattisesti ja seuraa maksuja.</p>
                <ul className="mt-4 space-y-2">
                  {["Automaattinen laskutus", "Maksumuistutukset", "Verkkolaskut"].map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="gap-1" asChild>
                  <a href="#laskutus">
                    Lue lisää <ChevronRight className="h-4 w-4" />
                  </a>
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Kuljetusten hallinta</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Suunnittele kuljetukset tehokkaasti ja seuraa toimituksia.</p>
                <ul className="mt-4 space-y-2">
                  {["Kuljetusreittien optimointi", "Toimitusaikojen hallinta", "Kuljettajien työlistat"].map(
                    (feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ),
                  )}
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="gap-1" asChild>
                  <a href="#kuljetukset">
                    Lue lisää <ChevronRight className="h-4 w-4" />
                  </a>
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Raportit ja analytiikka</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Seuraa liiketoimintasi kehitystä kattavien raporttien avulla.</p>
                <ul className="mt-4 space-y-2">
                  {["Myyntiraportit", "Asiakasanalyysit", "Tuotekohtaiset raportit"].map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="gap-1" asChild>
                  <a href="#raportit">
                    Lue lisää <ChevronRight className="h-4 w-4" />
                  </a>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Hinnoittelu */}
      <section className="w-full py-12 md:py-24 bg-gray-50" id="hinnoittelu">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center gap-4 text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Selkeä hinnoittelu ilman yllätyksiä</h2>
            <p className="text-muted-foreground text-lg max-w-[800px]">
              Valitse yrityksellesi sopiva paketti ja aloita Siikli ERP:n käyttö heti.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Aloituspaketti</CardTitle>
                <CardDescription>Pienille yrityksille ja yrittäjille</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">29€</span>
                  <span className="text-muted-foreground">/kk</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {["1 käyttäjä", "Tilausten hallinta", "Asiakashallinta", "Tuotehallinta", "Perusraportit"].map(
                    (feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ),
                  )}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Aloita 14 päivän kokeilu</Button>
              </CardFooter>
            </Card>
            <Card className="border-primary relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-white text-xs font-medium px-3 py-1 rounded-full">
                Suosituin
              </div>
              <CardHeader>
                <CardTitle>Yrityspaketti</CardTitle>
                <CardDescription>Kasvaville yrityksille</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">79€</span>
                  <span className="text-muted-foreground">/kk</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {[
                    "5 käyttäjää",
                    "Kaikki Aloituspaketin ominaisuudet",
                    "Laskutus",
                    "Kuljetusten hallinta",
                    "Edistyneet raportit",
                    "Sähköposti- ja puhelintuki",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Aloita 14 päivän kokeilu</Button>
              </CardFooter>
            </Card>
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Laajapaketti</CardTitle>
                <CardDescription>Suuremmille yrityksille</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">149€</span>
                  <span className="text-muted-foreground">/kk</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {[
                    "Rajaton määrä käyttäjiä",
                    "Kaikki Yrityspaketin ominaisuudet",
                    "API-integraatiot",
                    "Räätälöidyt raportit",
                    "Henkilökohtainen tukihenkilö",
                    "Koulutukset",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Aloita 14 päivän kokeilu</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Asiakaspalautteet */}
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
                name: "Matti Meikäläinen",
                company: "Leipomo Leivonnainen",
                quote:
                  "Siikli on mullistanut yrityksemme tilausten käsittelyn. Säästämme aikaa ja virheet ovat vähentyneet merkittävästi.",
              },
              {
                name: "Liisa Lahtinen",
                company: "Kukkakauppa Kukoistus",
                quote:
                  "Asiakashallinta ja laskutus toimivat nyt saumattomasti. Voin lämpimästi suositella Siikliä kaikille pienyrittäjille.",
              },
              {
                name: "Juha Jokinen",
                company: "Kuljetusliike Kiitäjä",
                quote:
                  "Kuljetusten suunnittelu on nyt tehokkaampaa kuin koskaan. Siikli maksoi itsensä takaisin jo ensimmäisen kuukauden aikana.",
              },
            ].map((testimonial, i) => (
              <Card key={i} className="bg-gray-50 border-none">
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
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
                    <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
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
                <a href="#kirjaudu">
                  Aloita ilmainen kokeilu <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
                asChild
              >
                <a href="#demo">Varaa esittely</a>
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
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight">Tietosi ovat turvassa</h2>
              <p className="text-muted-foreground text-lg">
                Siikli ERP on rakennettu alusta alkaen tietoturva huomioiden. Kaikki data on salattua ja säilytetään
                EU:n alueella GDPR-säädösten mukaisesti.
              </p>
              <ul className="mt-4 space-y-2">
                {[
                  "256-bittinen salaus kaikelle datalle",
                  "Säännölliset tietoturva-auditoinnit",
                  "Automaattiset varmuuskopiot",
                  "GDPR-yhteensopiva",
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="w-full max-w-md aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <img src="/placeholder.svg?height=300&width=500" alt="Tietoturva" className="rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-12 bg-gray-900 text-gray-300" id="yhteystiedot">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="font-bold text-2xl text-white">Siikli</span>
                <span className="text-sm font-medium text-gray-400">ERP</span>
              </div>
              <p className="text-gray-400">Tehokas toiminnanohjausjärjestelmä suomalaisille yrityksille.</p>
              <div className="flex gap-4 mt-2">
                {["twitter", "facebook", "instagram", "aedin"].map((social) => (
                  <a key={social} href={`#${social}`} className="text-gray-400 hover:text-white">
                    <span className="sr-only">{social}</span>
                    <div className="h-6 w-6 rounded-full bg-gray-800 flex items-center justify-center">
                      {social.charAt(0).toUpperCase()}
                    </div>
                  </a>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-medium text-white">Tuotteet</h3>
              <ul className="space-y-2">
                {[
                  "Tilausten hallinta",
                  "Asiakashallinta",
                  "Tuotehallinta",
                  "Laskutus",
                  "Kuljetusten hallinta",
                  "Raportit",
                ].map((item) => (
                  <li key={item}>
                    <a
                      href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                      className="text-gray-400 hover:text-white"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-medium text-white">Yritys</h3>
              <ul className="space-y-2">
                {["Tietoa meistä", "Blogi", "Työpaikat", "Kumppanit", "Lehdistö", "Yhteystiedot"].map((item) => (
                  <li key={item}>
                    <a
                      href={`${item.toLowerCase().replace('ä', 'a').replace(/\s+/g, "-")}`}
                      className="text-gray-400 hover:text-white"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-medium text-white">Tuki</h3>
              <ul className="space-y-2">
                {["Ohjeet", "Tukikeskus", "Yhteystiedot", "Koulutukset", "Webinaarit", "Kehittäjille"].map((item) => (
                  <li key={item}>
                    <a
                      href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                      className="text-gray-400 hover:text-white"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">© 2025 Siikli Oy. Kaikki oikeudet pidätetään.</p>
            <div className="flex gap-6">
              <a href="#tietosuoja" className="text-sm text-gray-400 hover:text-white">
                Tietosuoja
              </a>
              <a href="#kayttoehdot" className="text-sm text-gray-400 hover:text-white">
                Käyttöehdot
              </a>
              <a href="#evasteet" className="text-sm text-gray-400 hover:text-white">
                Evästeet
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
