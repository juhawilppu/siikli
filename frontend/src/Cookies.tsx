
import { useEffect } from "react"
import Footer from "./Footer"
import TopBar from "./TopBar"

export default function TermsOfService() {

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
                            Evästeet
                        </h1>
                        <p className="text-muted-foreground text-lg md:text-xl max-w-[800px]">
                            Tällä sivulla kerrotaan, mitä evästeitä Siikli käyttää ja miksi. Käytämme evästeitä vain silloin, kun niille on hyvä syy.
                        </p>
                    </div>
                </div>
            </section>

            <section className="w-full py-12 md:py-24 bg-white">
                <div className="container px-4 md:px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="flex flex-col gap-6">
                            <h2 className="text-3xl font-bold tracking-tight">Evästeet</h2>
                            <div className="space-y-4 text-muted-foreground">

                                <p>Viimeksi päivitetty: 3.5.2025</p>

                                <p>Tällä sivulla kerrotaan, mitä evästeitä Siikli-sivustolla käytetään ja mihin tarkoitukseen.</p>

                                <p>Evästeet (cookies) ovat pieniä tekstitiedostoja, joita selain tallentaa laitteellesi. Käytämme evästeitä, jotta sivusto toimii turvallisesti, ja jotta voimme kehittää palvelua paremmin ymmärtämällä sen käyttöä.</p>

                                <h2 className="text-l font-bold tracking-tight mt-4">Välttämättömät evästeet</h2>
                                <p>Nämä evästeet ovat sivuston toiminnan kannalta pakollisia, eikä niitä voi poistaa käytöstä:</p>

                                <ul>
                                    <li><pre className="text-muted-foreground text-sm">siikli-session</pre></li>
                                    <li>Käytetään kirjautuneen käyttäjän istunnon hallintaan. Eväste on välttämätön, jotta voit käyttää palvelua turvallisesti ja pysyä kirjautuneena.</li>
                                </ul>

                                <h2 className="text-l font-bold tracking-tight mt-4">Analytiikkaevästeet</h2>
                                <p>Käytämme PostHogia, jotta voimme seurata anonyymisti, miten palvelua käytetään. Tiedot auttavat meitä parantamaan käytettävyyttä ja tunnistamaan, mitkä ominaisuudet ovat hyödyllisiä.</p>

                                <ul>
                                    <li><pre className="text-muted-foreground text-sm">posthog_*</pre></li>
                                    <li>Evästeet, joita PostHog käyttää käyttäjän liikkeiden seuraamiseen sivustolla. Nämä eivät sisällä henkilötietoja, mutta niitä käytetään istunnon yhdistämiseen analytiikkaraporteissa.</li>
                                </ul>

                                <p>👉 <a className="text-blue-500" href="https://posthog.com/docs/privacy" target="_blank" rel="noopener noreferrer">Lue lisää PostHogin tietosuojakäytännöistä</a></p>

                                <p>Analytiikkaevästeet auttavat meitä kehittämään palvelua — emme käytä tietoja mainontaan tai jaa niitä kolmansille osapuolille.</p>

                                <h2 className="text-l font-bold tracking-tight mt-4">Virheiden seuranta</h2>
                                <p>Käytämme Sentry-palvelua mahdollisten virhetilanteiden tunnistamiseen ja korjaamiseen. Sentry ei käytä evästeitä eikä tallenna tietoja käyttäjän selaimeen.</p>

                                <p>👉 <a className="text-blue-500" href="https://sentry.io/privacy/" target="_blank" rel="noopener noreferrer">Lue lisää Sentryn tietosuojakäytännöistä</a></p>

                                <h2 className="text-l font-bold tracking-tight mt-4">Evästeiden hallinta</h2>
                                <p>Voit halutessasi estää tai poistaa evästeet selaimesi asetuksista. Huomioithan kuitenkin, että välttämättömien evästeiden estäminen voi estää palvelun käytön.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section >

            <Footer />
        </div >
    )
}
