
import { useEffect } from "react"
import Footer from "./Footer"
import TopBar from "./TopBar"

export default function ContactPage() {

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

            <section className="w-full py-12 md:py-24 bg-white">
                <div className="container px-4 md:px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="flex flex-col gap-6">
                            <h2 className="text-3xl font-bold tracking-tight">Yhteystiedot</h2>
                            <div className="space-y-4 text-muted-foreground">
                                <p>Ota yhteyttä matalalla kynnyksellä — vastaan mielelläni kysymyksiin ja kerron lisää Siiklistä.</p>

                                <p>✉️ <a className="text-blue-500" href="mailto:juha.wilppu@gmail.com">juha.wilppu@gmail.com</a></p>
                                <p>🔗 <a className="text-blue-500" href="https://www.linkedin.com/in/juhawilppu" target="_blank">LinkedIn-profiilini</a></p>

                                <p> Voit ottaa yhteyttä, jos:
                                    <ul>
                                        <li className="pl-4">➡️ Haluat kokeilla Siikliä</li>
                                        <li className="pl-4">➡️ Mietit sopiiko se teidän yritykselle</li>
                                        <li className="pl-4">➡️ Sinulla on kysyttävää toiminnallisuuksista tai tietoturvasta</li>
                                    </ul>
                                </p>
                                <p> Vastaan yleensä saman arkipäivän aikana. Viikonloppuisin luen viestejä satunnaisesti. </p>
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


            <Footer />
        </div >
    )
}
