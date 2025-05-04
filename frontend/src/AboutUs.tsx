import { MapPin } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
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

            <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-50">
                <div className="container px-4 md:px-6">
                    <div className="flex flex-col items-center text-center gap-4">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                            Tietoa meistä
                        </h1>
                        <p className="text-muted-foreground text-lg md:text-xl max-w-[800px]">
                            Siikli on yhden kehittäjän rakentama palvelu, joka on tehty auttamaan pienyrityksiä menestymään tehokkaasti.
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
                                    Siikli sai alkunsa vuonna 2017, kun Männistön Peruna (nykyään Aromäen tila) kaipasi yksinkertaista ja toimivaa järjestelmää laskutuksen hallintaan. Kehitin alkuperäisen version siis tuttavani maatalousyrityksen tarpeisiin — sama järjestelmä on sen jälkeen ollut luotettavasti tuotantokäytössä jo seitsemän vuotta!
                                </p>
                                <p>
                                    Vuonna 2025 Siikli siirtyi uudelle tasolle: järjestelmä rakennettiin kokonaan uudelleen ja nyt se tukee multi-tenant-arkkitehtuuria. Tämä mahdollistaa sen, että uusia asiakkaita voidaan ottaa mukaan helposti ja turvallisesti.
                                </p>
                                <Separator />
                                <p>
                                    💡 Tavoitteeni ei ole rakentaa isoa ohjelmistotaloa. Haluan rakentaa tuotteen, joka toimii oikeasti &ndash; ja palvelee yrityksiä, joilla ei ole aikaa tai varaa säätämiseen.
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

            <section className="w-full py-12 md:py-24 bg-white">
                <div className="container px-4 md:px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="flex justify-center">
                            <div className="relative w-1/2 bg-gray-100 rounded-lg overflow-hidden">
                                <img src="/juha_personal1.jpg" alt="Juha Wilppu" className="object-cover w-full h-full" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-6">
                            <h2 className="text-3xl font-bold tracking-tight">Tekijä</h2>
                            <div className="space-y-4 text-muted-foreground">
                                <p>Moi! 👋</p>
                                <p>Olen Juha — Siiklin kehittäjä ja perustaja.</p>
                                <p>Rakennan ohjelmistoja työkseni ja harrastuksena. Tykkään tehdä asiat selkeästi ja tehokkaasti. En kaipaa turhia palavereita tai raskaita rakenteita, vaan käytännöllisiä ratkaisuja, jotka toimivat oikeassa elämässä.</p>
                                <p>Siikli on minulle paikka tehdä asioita kunnolla — omalla tavallani, mutta asiakkaita kuunnellen.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {false && (
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
                                        "xxx",
                                    icon: "❤️",
                                },
                                {
                                    title: "Helppokäyttöisyys",
                                    description:
                                        "xxx",
                                    icon: "👍",
                                },
                                {
                                    title: "Jatkuva kehitys",
                                    description:
                                        "xxx",
                                    icon: "🚀",
                                },
                                {
                                    title: "Läpinäkyvyys",
                                    description:
                                        "xxx",
                                    icon: "🔍",
                                },
                                {
                                    title: "Yhteisöllisyys",
                                    description:
                                        "xxx",
                                    icon: "🤝",
                                },
                                {
                                    title: "Vastuullisuus",
                                    description:
                                        "xxx",
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
            )}

            {/* Tiimimme */}
            {false && (
                <section className="w-full py-12 md:py-24 bg-white">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center text-center gap-4 mb-12">
                            <h2 className="text-3xl font-bold tracking-tight">Tekijä</h2>
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
                                    email: "juha.wilppu@gmail.com",
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
                                            <p className="text-sm text-muted-foreground mt-2"><a href={`mailto:${member.email}`}>{member.email}</a></p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>
            )}

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
                                    <p className="text-muted-foreground">xxx</p>
                                </div>
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold">2020</h3>
                                    <p className="text-muted-foreground">xxx</p>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">2021</h3>
                                    <p className="text-muted-foreground">xxx</p>
                                </div>
                            </div>
                            <div className="relative pl-8 border-l-2 border-primary">
                                <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-primary"></div>
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold">2022</h3>
                                    <p className="text-muted-foreground">xxx</p>
                                </div>
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold">2023</h3>
                                    <p className="text-muted-foreground">xxx</p>
                                </div>
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold">2024</h3>
                                    <p className="text-muted-foreground">
                                        xxx
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">2025</h3>
                                    <p className="text-muted-foreground">
                                        xxx
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
                                        <h3 className="text-xl font-bold">xxx</h3>
                                        <p className="text-muted-foreground">
                                            xxx
                                            <br />
                                            xxxxx xxxx
                                            <br />
                                            xxx
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Aukioloajat</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="text-muted-foreground">Maanantai - Perjantai</div>
                                        <div>xx:xx - xx:xx</div>
                                        <div className="text-muted-foreground">Lauantai - Sunnuntai</div>
                                        <div>Suljettu</div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Yhteystiedot</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="text-muted-foreground">Puhelin</div>
                                        <div>xxx</div>
                                        <div className="text-muted-foreground">Sähköposti</div>
                                        <div>xxx</div>
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
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Haluatko rakentaa kanssani?</h2>

                        <p className="text-lg md:text-xl text-primary-foreground/80 max-w-[800px]">
                            Siikli ei ole kasvuyritys, jolla on HR-tiimi ja rekryputki. Se on yhden kehittäjän tuote, joka on ollut toiminnassa jo vuosia — ja on nyt valmis kehittymään seuraavalle tasolle.</p>

                        <p className="text-lg md:text-xl text-primary-foreground/80 max-w-[800px]">Etsin rinnalle toista tekijää, jolla on kiinnostusta rakentaa jotain oikeaa ja kestävää. Tämä ei ole työpaikka vaan mahdollisuus: jos koodi, asiakasymmärrys ja omistajuus tuntuvat tutuilta sanoilta, ota yhteyttä. Katsotaan, voisimmeko tehdä jotain yhdessä.
                        </p>

                        <p>✉️ <a className="text-white-500" href="mailto:juha.wilppu@gmail.com">juha.wilppu@gmail.com</a></p>
                    </div>
                </div>
            </section >

            <Footer />
        </div >
    )
}
