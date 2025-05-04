import { Check, HelpCircle } from "lucide-react"
import { Link } from "react-router-dom"

import Footer from "./Footer"
import LoginForm from "./LoginForm"
import TopBar from "./TopBar"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./components/ui/accordion"
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
                                Kirjaudu Siikli-järjestelmään
                            </h1>
                            <p className="text-muted-foreground text-lg md:text-xl max-w-[800px]">
                                Hallitse liiketoimintaasi tehokkaasti ja helposti yhdestä paikasta.
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
                                        Eikö sinulla ole vielä tunnuksia? Voit kirjautua tästä ja luoda tunnuksen.
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Kirjautumalla hyväksyt{" "}
                                        <Link href="#kayttoehdot" className="text-primary hover:underline">
                                            käyttöehdot
                                        </Link>{" "}
                                        ja{" "}
                                        <Link href="#tietosuoja" className="text-primary hover:underline">
                                            tietosuojakäytännön
                                        </Link>.
                                    </div>
                                </CardFooter>
                            </Card>
                            {/* Kokeilutiedot */}
                            <div className="flex flex-col space-y-8">
                                <Card className="bg-primary/5 border-primary/20">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            🎉 Ilmainen 3 kk kokeilu
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <p>
                                            Aloita Siikli ERP:n käyttö ilmaisella 3 kuukauden kokeilujaksolla. Saat käyttöösi kaikki
                                            järjestelmän ominaisuudet ilman rajoituksia.
                                        </p>
                                        <ul className="space-y-2">
                                            {[
                                                "Kirjautuminen ei sido mihinkään",
                                                "Luottokorttia ei tarvita",
                                                "Peruutus milloin tahansa",
                                                "Käytössäsi on kaikki ominaisuudet",
                                                "Henkilökohtainen tuki käyttöönotossa",
                                            ].map((feature) => (
                                                <li key={feature} className="flex items-center gap-2">
                                                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
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

            </main>

            <Footer />
        </div>
    )
}
