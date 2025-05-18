import { HelpCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './components/ui/accordion'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './components/ui/card'
import Footer from './Footer'
import LoginForm from './LoginForm'
import TopBar from './TopBar'

export default function LoginPage2() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigaatio */}
      <TopBar showBackButton hideLoginButton />

      {/* Pääsisältö */}
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-4 mb-12">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                Kirjaudu Siikliin
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl max-w-[800px]">
                Aloita ilmainen 3 kuukauden käyttöjakso &ndash; ilman sitoumuksia tai luottokorttia.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Kirjautumislomake */}
              <Card className="w-full mx-auto">
                <CardHeader>
                  <CardTitle>Kirjaudu sisään</CardTitle>
                  <CardDescription>Valitse kirjautumistapa ja pääset heti käyttämään järjestelmää</CardDescription>
                </CardHeader>
                <CardContent>
                  <LoginForm />
                </CardContent>
                <CardFooter className="flex flex-col items-start gap-2">
                  <div className="text-sm text-muted-foreground">
                    Eikö sinulla ole vielä tunnuksia? ➡️ Voit kirjautua tästä ja luoda tunnuksen.
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Kirjautumalla hyväksyt
                    {' '}
                    <Link href="#kayttoehdot" className="text-primary hover:underline">
                      käyttöehdot
                    </Link>
                    {' '}
                    ja
                    {' '}
                    <Link href="#tietosuoja" className="text-primary hover:underline">
                      tietosuojakäytännön
                    </Link>
                    .
                  </div>
                </CardFooter>
              </Card>
              {/* Kokeilutiedot */}
              <div className="flex flex-col space-y-8">
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      🎉 3 kuukauden ilmainen kokeilu
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p>
                      Saat käyttöösi kaikki ominaisuudet ilman rajoituksia.
                      Luottokorttia ei kysytä. Voit peruuttaa milloin tahansa.
                    </p>
                    <ul className="space-y-2">
                      {[
                        'Ei sitoutumista',
                        'Henkilökohtainen tuki',
                        'Kaikki ominaisuudet käytössä',
                      ].map(feature => (
                        <li key={feature} className="flex items-center gap-2">
                          <span>
                            ✅ {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <p>Jos olet epävarma, ota rohkeasti yhteyttä. Kerron mielelläni lisää ja voit vaikka kokeilla Siikliä kevyesti.</p>
                  </CardContent>
                </Card>

                {/* UKK */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HelpCircle className="h-5 w-5" />
                      Usein kysytyt kysymykset
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="item-1">
                        <AccordionTrigger>Tarvitsenko luottokorttia kokeilun aloittamiseen?</AccordionTrigger>
                        <AccordionContent>
                          Et. Kokeilu on täysin maksuton eikä vaadi maksutietoja.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-2">
                        <AccordionTrigger>Miten voin perua kokeilun?</AccordionTrigger>
                        <AccordionContent>
                          Voit lopettaa käytön milloin tahansa. Kokeilun päättyessä ei veloiteta mitään.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-3">
                        <AccordionTrigger>Mitä tapahtuu kokeilujakson päätyttyä?</AccordionTrigger>
                        <AccordionContent>
                          Saat muistutuksen sähköpostitse. Voit jatkaa valitsemalla hinnoittelupaketin tai lopettaa käytön. Tietosi säilytetään 30 päivän ajan.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-4">
                        <AccordionTrigger>Saanko tukea kokeilujakson aikana?</AccordionTrigger>
                        <AccordionContent>
                          Kyllä. Autan mielelläni, jos sinulla on kysyttävää tai tarvitset apua käyttöönotossa.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-5">
                        <AccordionTrigger>Voinko siirtää tietoni toisesta järjestelmästä?</AccordionTrigger>
                        <AccordionContent>
                          Keskustellaan! Jos käytössäsi on nykyinen järjestelmä, katsotaan miten tiedot saadaan siirrettyä.
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}
