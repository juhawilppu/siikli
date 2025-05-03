
import { useEffect } from "react"
import Footer from "./Footer"
import TopBar from "./TopBar"

export default function AboutUsPage() {

    useEffect(() => {
        scrollToTop()
    }, [])

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    return (
        <div className="flex min-h-screen flex-col">
            <TopBar />

            {/* Hero-osio */}
            <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-50">
                <div className="container px-4 md:px-6">
                    <div className="flex flex-col items-center text-center gap-4">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                            Tietosuoja
                        </h1>
                        <p className="text-muted-foreground text-lg md:text-xl max-w-[800px]">
                            Siikli on yhden kehittäjän intohimoprojekti, joka on tehty auttamaan pienyrityksiä menestymään tehokkaasti.
                        </p>
                    </div>
                </div>
            </section>

            {/* Tarinamme */}
            <section className="w-full py-12 md:py-24 bg-white">
                <div className="container px-4 md:px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="flex flex-col gap-6">
                            <h2 className="text-3xl font-bold tracking-tight">Tietosuojaseloste</h2>
                            <div className="space-y-4 text-muted-foreground">
                                <p>Viimeksi päivitetty: 3.5.2025</p>

                                <h2 className="text-l font-bold tracking-tight mt-4">1. Rekisterinpitäjä</h2>
                                <p>Siikli</p>
                                <p>Y-tunnus: 2812416-4</p>
                                <p>Sähköposti: juha.wilppu@gmail.com</p>
                                <p>Paikkakunta: Espoo</p>

                                <h2 className="text-l font-bold tracking-tight mt-4">2. Mitä henkilötietoja keräämme?</h2>
                                <p>Siikli voi kerätä ja käsitellä seuraavia tietoja:</p>
                                <p>Nimi ja yhteystiedot (sähköposti, puhelinnumero)</p>
                                <p>Yrityksen nimi ja laskutustiedot</p>
                                <p>Käyttöön ja asiakassuhteeseen liittyviä tietoja</p>
                                <p>Verkkosivun vierailutiedot (evästeiden kautta)</p>

                                <p>Tietoja kerätään pääosin silloin, kun:</p>
                                <p>Otat meihin yhteyttä lomakkeella tai sähköpostitse</p>
                                <p>Käytät palveluamme asiakkaana</p>
                                <p>Käytät verkkosivustoamme</p>

                                <h2 className="text-l font-bold tracking-tight mt-4">3. Mihin tietoja käytetään?</h2>
                                <p>Tietoja käytetään:</p>
                                <p>Asiakassuhteen hoitamiseen</p>
                                <p>Palvelun tarjoamiseen ja kehittämiseen</p>
                                <p>Laskutukseen</p>
                                <p>Yhteydenpitoon</p>
                                <p>Verkkosivun käytön analysointiin ja kehittämiseen</p>

                                <p>Tietoja ei luovuteta kolmansille osapuolille ilman suostumustasi, ellei lainsäädäntö sitä edellytä.</p>

                                <h2 className="text-l font-bold tracking-tight mt-4">4. Evästeet (cookies)</h2>
                                <p>Sivustolla voidaan käyttää evästeitä, jotta sivusto toimisi teknisesti oikein ja jotta sen käyttöä voidaan analysoida. Voit halutessasi estää evästeet selaimesi asetuksista.</p>

                                <h2 className="text-l font-bold tracking-tight mt-4">5. Tietojen säilytys</h2>
                                <p>Säilytämme henkilötietoja vain niin kauan kuin se on tarpeellista asiakassuhteen ylläpitämiseksi tai lain edellyttämien velvollisuuksien täyttämiseksi.</p>

                                <h2 className="text-l font-bold tracking-tight mt-4">6. Oikeutesi</h2>
                                <p>Sinulla on oikeus:</p>
                                <p>Tarkastaa itseäsi koskevat tiedot</p>
                                <p>Pyytää virheellisten tietojen oikaisua</p>
                                <p>Pyytää tietojen poistamista</p>
                                <p>Vastustaa tai rajoittaa tietojesi käsittelyä</p>
                                <p>Tehdä valitus tietosuojavaltuutetulle</p>
                                <p>Ota yhteyttä sähköpostitse osoitteeseen juha.wilppu@gmail.com, jos haluat käyttää oikeuksiasi.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div >
    )
}
