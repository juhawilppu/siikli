import { ArrowRight, MapPin } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { NavLink } from "react-router-dom"

export default function AboutUsPage() {
    return (
        <div className="flex min-h-screen flex-col">
            {/* Navigaatio */}
            <header className="sticky top-0 z-50 w-full border-b bg-white">
                <div className="container flex h-16 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <NavLink href="/" className="flex items-center gap-2">
                            <span className="font-bold text-2xl text-primary">Siikli</span>
                            <span className="text-sm font-medium text-muted-foreground">ERP</span>
                        </NavLink>
                    </div>
                    <nav className="hidden md:flex gap-6 items-center">
                        <NavLink
                            href="/#ominaisuudet"
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Ominaisuudet
                        </NavLink>
                        <NavLink
                            href="/#hinnoittelu"
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Hinnoittelu
                        </NavLink>
                        <NavLink href="/tietoa-meista" className="text-sm font-medium text-foreground transition-colors">
                            Tietoa meistä
                        </NavLink>
                        <NavLink
                            href="/#tuki"
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Tuki
                        </NavLink>
                        <NavLink
                            href="/#yhteystiedot"
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Yhteystiedot
                        </NavLink>
                    </nav>
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" asChild>
                            <NavLink href="/#demo">Kokeile demoa</NavLink>
                        </Button>
                        <Button size="sm" asChild>
                            <NavLink href="/#kirjaudu">Kirjaudu sisään</NavLink>
                        </Button>
                    </div>
                </div>
            </header>

            {/* Hero-osio */}
            <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-50">
                <div className="container px-4 md:px-6">
                    <div className="flex flex-col items-center text-center gap-4">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                            Tietoa Siiklistä
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
                            <h2 className="text-3xl font-bold tracking-tight">Tarinamme</h2>
                            <div className="space-y-4 text-muted-foreground">
                                <p>
                                    Siikli sai alkunsa vuonna 2017, kun Männistön Peruna (nykyään Aromäen tila) kaipasi yksinkertaista ja toimivaa järjestelmää laskutuksen hallintaan.
                                </p>
                                <p>
                                    Olen kokenut ohjelmistokehittäjä ja tiiminvetäjä, jolla on 13 vuoden kokemus ohjelmistojen suunnittelusta, rakentamisesta ja pyörittämisestä. Kehitin alkuperäisen version tuttavani maatalousyrityksen tarpeisiin — sama järjestelmä on sen jälkeen hoitanut yli 13 miljoonan euron laskutuksen ja ollut luotettavasti tuotantokäytössä jo seitsemän vuotta.
                                </p>
                                <p>
                                    Vuonna 2025 Siikli siirtyi uudelle tasolle: järjestelmä rakennettiin kokonaan uudelleen ja nyt se tukee multi-tenant-arkkitehtuuria. Tämä mahdollistaa sen, että uusia asiakkaita voidaan ottaa mukaan helposti ja turvallisesti.
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-center">
                            <div className="relative w-1/2 bg-gray-100 rounded-lg overflow-hidden">
                                <img src="/juha.jpg" alt="Juha Wilppu" className="object-cover w-full h-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Arvomme */}
            <section className="w-full py-12 md:py-24 bg-gray-50">
                <div className="container px-4 md:px-6">
                    <div className="flex flex-col items-center text-center gap-4 mb-12">
                        <h2 className="text-3xl font-bold tracking-tight">Arvomme</h2>
                        <p className="text-muted-foreground text-lg max-w-[800px]">
                            Nämä arvot ohjaavat kaikkea toimintaamme ja päätöksentekoamme.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Asiakaslähtöisyys",
                                description:
                                    "Asiakkaidemme menestys on meidän menestyksemme. Kuuntelemme aktiivisesti asiakkaidemme tarpeita ja kehitämme tuotteitamme niiden pohjalta.",
                                icon: "❤️",
                            },
                            {
                                title: "Helppokäyttöisyys",
                                description:
                                    "Uskomme, että teknologian tulisi helpottaa elämää, ei monimutkaistaa sitä. Suunnittelemme tuotteemme niin, että niitä on miellyttävä ja helppo käyttää.",
                                icon: "👍",
                            },
                            {
                                title: "Jatkuva kehitys",
                                description:
                                    "Emme koskaan pysähdy. Kehitämme jatkuvasti tuotteitamme ja osaamistamme tarjotaksemme asiakkaillemme parasta mahdollista palvelua.",
                                icon: "🚀",
                            },
                            {
                                title: "Läpinäkyvyys",
                                description:
                                    "Toimimme avoimesti ja rehellisesti kaikissa tilanteissa. Viestimme selkeästi ja pidämme lupauksemme.",
                                icon: "🔍",
                            },
                            {
                                title: "Yhteisöllisyys",
                                description:
                                    "Arvostamme yhteistyötä ja uskomme, että yhdessä olemme enemmän. Tämä koskee sekä tiimiämme että yhteistyötä asiakkaidemme kanssa.",
                                icon: "🤝",
                            },
                            {
                                title: "Vastuullisuus",
                                description:
                                    "Kannamme vastuumme ympäristöstä ja yhteiskunnasta. Pyrimme tekemään kestäviä valintoja ja edistämään kestävää kehitystä.",
                                icon: "🌱",
                            },
                        ].map((value, i) => (
                            <Card key={i} className="bg-white border-none shadow-md">
                                <CardContent className="pt-6">
                                    <div className="flex flex-col items-center gap-4 text-center">
                                        <div className="text-4xl">{value.icon}</div>
                                        <h3 className="text-xl font-bold">{value.title}</h3>
                                        <p className="text-muted-foreground">{value.description}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tiimimme */}
            <section className="w-full py-12 md:py-24 bg-white">
                <div className="container px-4 md:px-6">
                    <div className="flex flex-col items-center text-center gap-4 mb-12">
                        <h2 className="text-3xl font-bold tracking-tight">Tiimimme</h2>
                        <p className="text-muted-foreground text-lg max-w-[800px]">
                            Tutustutaan ihmisiin Siikli ERP:n takana. Tiimimme koostuu intohimoisista ammattilaisista, jotka ovat
                            omistautuneet auttamaan asiakkaitamme menestymään.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[
                            {
                                name: "Juha Wilppu",
                                title: "Ohjelmistokehittäjä & perustaja",
                                bio: "Juhalla on 13 vuoden kokemus ohjelmistojen suunnittelusta, rakentamisesta ja pyörittämisestä.",
                                image: '/juha4.png'
                            },
                        ].map((member, i) => (
                            <Card key={i} className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-0">
                                    <div className="aspect-square bg-gray-100 relative">
                                        <img
                                            src={member.image}
                                            alt={member.name}
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold">{member.name}</h3>
                                        <p className="text-sm text-primary">{member.title}</p>
                                        <p className="text-sm text-muted-foreground mt-2">{member.bio}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {false && (
                <section className="w-full py-12 md:py-24 bg-gray-50">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center text-center gap-4 mb-12">
                            <h2 className="text-3xl font-bold tracking-tight">Saavutuksemme</h2>
                            <p className="text-muted-foreground text-lg max-w-[800px]">
                                Olemme ylpeitä matkastamme ja saavutuksistamme tähän mennessä.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="relative pl-8 border-l-2 border-primary">
                                <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-primary"></div>
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold">2017</h3>
                                    <p className="text-muted-foreground">Siikli sai alkunsa</p>
                                </div>
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold">2019</h3>
                                    <p className="text-muted-foreground">Ensimmäinen versio Siikli ERP:stä julkaistaan</p>
                                </div>
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold">2020</h3>
                                    <p className="text-muted-foreground">Saavutamme 100 asiakkaan rajapyykin</p>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">2021</h3>
                                    <p className="text-muted-foreground">Laajennamme toimintaamme ja palkkaamme 10. työntekijämme</p>
                                </div>
                            </div>
                            <div className="relative pl-8 border-l-2 border-primary">
                                <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-primary"></div>
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold">2022</h3>
                                    <p className="text-muted-foreground">Julkaisemme Siikli ERP 2.0:n uusilla ominaisuuksilla</p>
                                </div>
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold">2023</h3>
                                    <p className="text-muted-foreground">Voitamme "Vuoden ohjelmistoyritys" -palkinnon</p>
                                </div>
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold">2024</h3>
                                    <p className="text-muted-foreground">
                                        Saavutamme 500 asiakkaan rajapyykin ja laajennamme toimintaamme Pohjoismaihin
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">2025</h3>
                                    <p className="text-muted-foreground">
                                        Tavoitteenamme on palvella 1000 yritystä ja laajentua Eurooppaan
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {false && (
                <section className="w-full py-12 md:py-24 bg-white">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center text-center gap-4 mb-12">
                            <h2 className="text-3xl font-bold tracking-tight">Toimistomme</h2>
                            <p className="text-muted-foreground text-lg max-w-[800px]">
                                Tervetuloa vierailemaan toimistollamme Helsingin keskustassa.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="h-[400px] bg-gray-100 rounded-lg overflow-hidden">
                                <img
                                    src="/placeholder.svg?height=400&width=600&text=Kartta"
                                    alt="Toimiston sijainti kartalla"
                                    className="object-cover w-full h-full"
                                />
                            </div>
                            <div className="flex flex-col justify-center gap-6">
                                <div className="flex items-start gap-4">
                                    <MapPin className="h-6 w-6 text-primary mt-1" />
                                    <div>
                                        <h3 className="text-xl font-bold">Päätoimisto - Helsinki</h3>
                                        <p className="text-muted-foreground">
                                            Mannerheimintie 123
                                            <br />
                                            00100 Helsinki
                                            <br />
                                            Suomi
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Aukioloajat</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="text-muted-foreground">Maanantai - Perjantai</div>
                                        <div>9:00 - 17:00</div>
                                        <div className="text-muted-foreground">Lauantai - Sunnuntai</div>
                                        <div>Suljettu</div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Yhteystiedot</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="text-muted-foreground">Puhelin</div>
                                        <div>+358 10 123 4567</div>
                                        <div className="text-muted-foreground">Sähköposti</div>
                                        <div>info@siikli.fi</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )
            }

            {/* CTA */}
            <section className="w-full py-12 md:py-24 bg-primary text-primary-foreground">
                <div className="container px-4 md:px-6">
                    <div className="flex flex-col items-center text-center gap-4 md:gap-8">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Haluatko liittyä tiimiimme?</h2>
                        <p className="text-lg md:text-xl text-primary-foreground/80 max-w-[800px]">
                            Etsimme jatkuvasti uusia osaajia tiimiimme. Tutustu avoimiin työpaikkoihin ja lähetä hakemuksesi.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 mt-4">
                            {false && (
                                <Button size="lg" variant="secondary" asChild>
                                    <NavLink href="#avoimet-tyopaikat">
                                        Katso avoimet työpaikat <ArrowRight className="ml-2 h-4 w-4" />
                                    </NavLink>
                                </Button>
                            )}
                            <Button
                                size="lg"
                                variant="outline"
                                className="bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
                                asChild
                            >
                                <a href="mailto:juha.wilppu@gmail.com">Ota yhteyttä</a>
                            </Button>
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
                                {["twitter", "facebook", "instagram", "NavLinkedin"].map((social) => (
                                    <NavLink key={social} href={`#${social}`} className="text-gray-400 hover:text-white">
                                        <span className="sr-only">{social}</span>
                                        <div className="h-6 w-6 rounded-full bg-gray-800 flex items-center justify-center">
                                            {social.charAt(0).toUpperCase()}
                                        </div>
                                    </NavLink>
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
                                        <NavLink
                                            href={`/#${item.toLowerCase().replace(/\s+/g, "-")}`}
                                            className="text-gray-400 hover:text-white"
                                        >
                                            {item}
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="flex flex-col gap-4">
                            <h3 className="text-lg font-medium text-white">Yritys</h3>
                            <ul className="space-y-2">
                                {[
                                    { name: "Tietoa meistä", href: "/tietoa-meista" },
                                    { name: "Blogi", href: "#blogi" },
                                    { name: "Työpaikat", href: "#tyopaikat" },
                                    { name: "Kumppanit", href: "#kumppanit" },
                                    { name: "Lehdistö", href: "#lehdisto" },
                                    { name: "Yhteystiedot", href: "#yhteystiedot" },
                                ].map((item) => (
                                    <li key={item.name}>
                                        <NavLink href={item.href} className="text-gray-400 hover:text-white">
                                            {item.name}
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="flex flex-col gap-4">
                            <h3 className="text-lg font-medium text-white">Tuki</h3>
                            <ul className="space-y-2">
                                {["Ohjeet", "Tukikeskus", "Yhteystiedot", "Koulutukset", "Webinaarit", "Kehittäjille"].map((item) => (
                                    <li key={item}>
                                        <NavLink
                                            href={`/#${item.toLowerCase().replace(/\s+/g, "-")}`}
                                            className="text-gray-400 hover:text-white"
                                        >
                                            {item}
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-gray-400">© 2025 Siikli</p>
                        <div className="flex gap-6">
                            <NavLink href="#tietosuoja" className="text-sm text-gray-400 hover:text-white">
                                Tietosuoja
                            </NavLink>
                            <NavLink href="#kayttoehdot" className="text-sm text-gray-400 hover:text-white">
                                Käyttöehdot
                            </NavLink>
                            <NavLink href="#evasteet" className="text-sm text-gray-400 hover:text-white">
                                Evästeet
                            </NavLink>
                        </div>
                    </div>
                </div>
            </footer>
        </div >
    )
}
