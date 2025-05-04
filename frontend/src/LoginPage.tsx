import { ArrowRight, Check, HelpCircle } from "lucide-react"
import { Link } from "react-router-dom"

import Footer from "./Footer"
import LoginForm from "./LoginForm"
import TopBar from "./TopBar"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./components/ui/accordion"
import { Button } from "./components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./components/ui/card"


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
                                Kirjaudu Siikli ERP -järjestelmään
                            </h1>
                            <p className="text-muted-foreground text-lg md:text-xl max-w-[800px]">
                                Hallitse liiketoimintaasi tehokkaasti ja helposti yhdestä paikasta.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                            {/* Kirjautumislomake */}
                            <Card className="w-full max-w-md mx-auto">
                                <CardHeader>
                                    <CardTitle>Kirjaudu sisään</CardTitle>
                                    <CardDescription>Valitse kirjautumistapa ja pääset heti käyttämään järjestelmää</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <LoginForm />
                                </CardContent>
                                <CardFooter className="flex flex-col items-start gap-2">
                                    <div className="text-sm text-muted-foreground">
                                        Eikö sinulla ole vielä tunnuksia?{" "}
                                        <Link href="#rekisteroidy" className="font-medium text-primary hover:underline">
                                            Rekisteröidy nyt
                                        </Link>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Kirjautumalla hyväksyt{" "}
                                        <Link href="#kayttoehdot" className="text-primary hover:underline">
                                            käyttöehdot
                                        </Link>{" "}
                                        ja{" "}
                                        <Link href="#tietosuoja" className="text-primary hover:underline">
                                            tietosuojakäytännön
                                        </Link>
                                    </div>
                                </CardFooter>
                            </Card>

                            {/* Kokeilutiedot */}
                            <div className="flex flex-col space-y-8">
                                <Card className="bg-primary/5 border-primary/20">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <span className="bg-primary text-white p-1 rounded-full">
                                                <Check className="h-4 w-4" />
                                            </span>
                                            Ilmainen 3 kuukauden kokeilu
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <p>
                                            Aloita Siikli ERP:n käyttö ilmaisella 3 kuukauden kokeilujaksolla. Saat käyttöösi kaikki
                                            järjestelmän ominaisuudet ilman rajoituksia.
                                        </p>
                                        <ul className="space-y-2">
                                            {[
                                                "Ei luottokorttitietoja",
                                                "Peruutus milloin tahansa",
                                                "Kaikki ominaisuudet käytössä",
                                                "Rajoittamaton käyttäjämäärä kokeilun aikana",
                                                "Henkilökohtainen tuki käyttöönotossa",
                                            ].map((feature) => (
                                                <li key={feature} className="flex items-center gap-2">
                                                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                    <CardFooter>
                                        <Button className="w-full" asChild>
                                            <Link href="#rekisteroidy">
                                                Aloita ilmainen kokeilu <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </CardFooter>
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
                                                    Et tarvitse. Voit aloittaa 3 kuukauden ilmaisen kokeilun ilman luottokorttitietoja. Emme
                                                    veloita sinua automaattisesti kokeilujakson päätyttyä.
                                                </AccordionContent>
                                            </AccordionItem>
                                            <AccordionItem value="item-2">
                                                <AccordionTrigger>Miten voin perua kokeilun?</AccordionTrigger>
                                                <AccordionContent>
                                                    Voit perua kokeilun milloin tahansa kirjautumalla tilillesi ja valitsemalla "Peruuta kokeilu"
                                                    asetuksista. Voit myös ottaa yhteyttä asiakaspalveluumme, joka auttaa sinua peruutuksessa.
                                                </AccordionContent>
                                            </AccordionItem>
                                            <AccordionItem value="item-3">
                                                <AccordionTrigger>Mitä tapahtuu kokeilujakson päätyttyä?</AccordionTrigger>
                                                <AccordionContent>
                                                    Kokeilujakson päätyttyä saat ilmoituksen sähköpostiisi. Voit joko jatkaa palvelun käyttöä
                                                    valitsemalla sopivan hinnoittelupaketin tai lopettaa käytön ilman lisäkustannuksia. Tietosi
                                                    säilytetään 30 päivän ajan kokeilun päättymisen jälkeen.
                                                </AccordionContent>
                                            </AccordionItem>
                                            <AccordionItem value="item-4">
                                                <AccordionTrigger>Saanko tukea kokeilujakson aikana?</AccordionTrigger>
                                                <AccordionContent>
                                                    Kyllä, tarjoamme täyden tuen myös kokeilujakson aikana. Voit ottaa yhteyttä asiakaspalveluumme
                                                    sähköpostitse, puhelimitse tai chat-palvelun kautta. Järjestämme myös ilmaisia
                                                    käyttöönottokoulutuksia kokeilukäyttäjille.
                                                </AccordionContent>
                                            </AccordionItem>
                                            <AccordionItem value="item-5">
                                                <AccordionTrigger>Voinko siirtää tietoni toisesta järjestelmästä?</AccordionTrigger>
                                                <AccordionContent>
                                                    Kyllä, autamme sinua tietojen siirrossa muista järjestelmistä. Kokeilujakson aikana voit
                                                    hyödyntää ilmaista tiedonsiirtopalveluamme, jossa asiantuntijamme auttavat siirtämään
                                                    asiakastiedot, tuotetiedot ja muut tärkeät tiedot Siikli ERP:hen.
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Rekisteröitymiskehotus */}
                <section className="w-full py-12 md:py-24 bg-white">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="md:w-1/2 space-y-4">
                                <h2 className="text-3xl font-bold tracking-tight">Etkö ole vielä rekisteröitynyt?</h2>
                                <p className="text-muted-foreground text-lg">
                                    Rekisteröityminen on helppoa ja nopeaa. Aloita ilmainen 3 kuukauden kokeilu jo tänään ja näe, miten
                                    Siikli ERP voi tehostaa yrityksesi toimintaa.
                                </p>
                                <ul className="space-y-2">
                                    {[
                                        "Rekisteröityminen vie vain muutaman minuutin",
                                        "Voit aloittaa järjestelmän käytön heti",
                                        "Ei sitoutumista, ei piilokuluja",
                                    ].map((item) => (
                                        <li key={item} className="flex items-center gap-2">
                                            <Check className="h-4 w-4 text-primary" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="pt-4">
                                    <Button size="lg" asChild>
                                        <Link href="#rekisteroidy">
                                            Rekisteröidy nyt <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                            <div className="md:w-1/2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Mitä saat rekisteröityessäsi?</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-4">
                                            {[
                                                {
                                                    title: "Täysi pääsy kaikkiin ominaisuuksiin",
                                                    description: "Kokeile kaikkia Siikli ERP:n ominaisuuksia ilman rajoituksia.",
                                                },
                                                {
                                                    title: "Henkilökohtainen käyttöönottotuki",
                                                    description: "Asiantuntijamme auttavat sinua järjestelmän käyttöönotossa.",
                                                },
                                                {
                                                    title: "Ilmaiset koulutukset",
                                                    description: "Osallistu ilmaisiin verkkokoulutuksiin kokeilujakson aikana.",
                                                },
                                                {
                                                    title: "Tietojen siirto",
                                                    description: "Autamme siirtämään tietosi nykyisestä järjestelmästäsi Siikliin.",
                                                },
                                            ].map((item, i) => (
                                                <li key={i} className="flex gap-4">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                        <span className="font-medium text-primary">{i + 1}</span>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium">{item.title}</h3>
                                                        <p className="text-sm text-muted-foreground">{item.description}</p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
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
