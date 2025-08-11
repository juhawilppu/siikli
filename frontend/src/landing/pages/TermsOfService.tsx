import { useEffect } from 'react'
import Footer from '../components/Footer'
import TopBar from '../components/TopBar'

export default function TermsOfService() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  useEffect(() => {
    scrollToTop()
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />

      {/* Hero-osio */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center gap-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              Käyttöehdot
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-[800px]">
              Alta löydät Siikli-palvelun käyttöehdot. Käyttämällä palvelua hyväksyt nämä ehdot. Ehdot on kirjoitettu selkeästi, jotta tiedät, mihin sitoudut.
            </p>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 bg-white">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-6">
              <h2 className="text-3xl font-bold tracking-tight">Käyttöehdot</h2>
              <div className="space-y-4 text-muted-foreground">

                <p>Viimeksi päivitetty: 3.5.2025</p>

                <p>Nämä käyttöehdot koskevat Siikli-palvelun käyttöä. Käyttämällä palvelua hyväksyt nämä ehdot. Mikäli et hyväksy ehtoja, älä käytä palvelua.</p>

                <h2 className="text-l font-bold tracking-tight mt-4">1. Palvelun tarjoaja</h2>
                <p>Siikli</p>
                <p>Y-tunnus: 2840288-8</p>
                <p>Sähköposti: juha.wilppu@siikli.fi</p>

                <h2 className="text-l font-bold tracking-tight mt-4">2. Palvelun sisältö</h2>
                <p>Siikli on selainpohjainen järjestelmä, jonka avulla pienyritykset voivat hallita toimintaansa, kuten laskutusta ja asiakastietoja. Palvelua kehitetään jatkuvasti, ja sisältö saattaa muuttua ilman erillistä ilmoitusta.</p>

                <h2 className="text-l font-bold tracking-tight mt-4">3. Käyttöoikeus</h2>
                <p>Asiakkaalla on oikeus käyttää palvelua sovitun laajuuden mukaisesti. Kaikki oikeudet palveluun ja sen sisältöön (mm. ohjelmakoodi, ulkoasu ja aineistot) kuuluvat palveluntarjoajalle, ellei toisin ole sovittu.</p>

                <h2 className="text-l font-bold tracking-tight mt-4">4. Käyttäjän vastuut</h2>
                <p>Käyttäjä sitoutuu:</p>
                <p>Käyttämään palvelua lain ja hyvän tavan mukaisesti</p>
                <p>Huolehtimaan omien tunnustensa salassapidosta</p>
                <p>Olemaan yrittämättä murtaa, kiertää tai häiritä palvelun teknisiä suojausratkaisuja</p>

                <h2 className="text-l font-bold tracking-tight mt-4">5. Tietosuoja</h2>
                <p>Henkilötietojen käsittelystä kerrotaan erillisessä Tietosuojaselosteessa. Palvelun käyttö edellyttää, että hyväksyt tietosuojakäytännöt.</p>

                <h2 className="text-l font-bold tracking-tight mt-4">6. Palvelun saatavuus ja vastuunrajoitus</h2>
                <p>Siikli-palvelu tarjotaan "sellaisena kuin se on". Pyrimme pitämään palvelun toiminnassa, mutta emme voi taata jatkuvaa saatavuutta tai virheettömyyttä. Emme vastaa mahdollisista välillisistä vahingoista, kuten liiketoiminnan keskeytymisestä tai tietojen menetyksestä.</p>

                <h2 className="text-l font-bold tracking-tight mt-4">7. Muutokset</h2>
                <p>Voimme päivittää näitä käyttöehtoja tarvittaessa. Merkittävistä muutoksista ilmoitetaan palvelun käyttäjille. Jatkamalla palvelun käyttöä muutosten jälkeen hyväksyt uudet ehdot.</p>

                <h2 className="text-l font-bold tracking-tight mt-4">8. Sovellettava laki ja erimielisyydet</h2>
                <p>Näihin ehtoihin sovelletaan Suomen lakia. Mahdolliset erimielisyydet pyritään ratkaisemaan ensisijaisesti neuvottelemalla. Viime kädessä erimielisyydet ratkaistaan Helsingin käräjäoikeudessa.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
