import Decimal from 'decimal.js'

export function getRandomFromList<T>(list: T[]) {
  return list[Math.floor(Math.random() * list.length)]
}

export function getRandomFreetext() {
  return Math.random() > 0.9
    ? (() => {
        const freetexts = [
          'Erikoistuote',
          'Toimitetaan kylmänä',
          'Lisäpakkaus',
          'Nopea toimitus',
          'Vain nouto',
          'Sisältää alennuksen',
          'Tarkista laatu',
          'Pakkaa erikseen',
          'Ei vaihto-oikeutta',
          'Kysy lisää',
          'Testierä',
          'Rajoitettu erä',
          'Kokeilutuote',
          'Vain tänään',
          'Tilaustuote',
        ]
        return getRandomFromList(freetexts)
      })()
    : null
}

export function getRandomNote() {
  if (Math.random() > 0.9) {
    const headers = [
      'Toimitus',
      'Huomio',
      'Erikoisohje',
      'Lisätieto',
      'Tärkeää',
      'Nouto',
      'Muistutus',
      'Viestit',
      'Ohje',
      'Tarkennus',
    ]
    const bodies = [
      'Toimitus ovelle H3. Nouto aamulla.',
      'Jätä paketti varaston taakse.',
      'Soita ennen toimitusta.',
      'Toimitus vain arkipäivisin.',
      'Nouto sovittuna aikana.',
      'Tarkista tuotteiden laatu ennen vastaanottoa.',
      'Lisäohjeet puhelimitse.',
      'Ei toimitusta sateella.',
      'Pakkaa tuotteet erikseen.',
      'Vältä ruuhka-aikoja toimituksessa.',
      'Toimitus suoraan asiakkaalle.',
      'Nouto iltapäivällä.',
      'Toimitus hissittömään kerrokseen.',
      'Erikoistoive: ei muovipusseja.',
      'Soita ovikelloa saapuessa.',
    ]
    return {
      header: getRandomFromList(headers),
      body: getRandomFromList(bodies),
    }
  }
  return null
}

export function getRandomAmount(packageSize: number) {
  return new Decimal(packageSize * Math.floor(Math.random() * 10))
}

export function getRandomCustomer() {
  function maybe<T>(value: T): T | null {
    return Math.random() > 0.5 ? value : null
  }

  const names = [
    'Kauppa Oy',
    'Ruokakauppa',
    'Testiasiakas',
    'Yritys Oy',
    'Asiakas Oy',
    'Supermarket',
    'Market',
    'Tukkuri',
    'Pieni kauppa',
    'Iso yritys',
  ]
  const cities = ['Helsinki', 'Espoo', 'Vantaa', 'Turku', 'Tampere', 'Oulu', 'Jyväskylä', 'Kuopio', 'Lahti', 'Pori']
  const streets = ['Testikatu 1', 'Helsingintie 5', 'Kauppakatu 10', 'Rantatie 3', 'Puistotie 7', 'Asemakatu 2']
  const emails = ['asiakas@example.com', 'info@yritys.fi', 'contact@kauppa.com', 'testi@firma.fi', 'myynti@supermarket.fi']
  const groups = ['Test group', 'J-Kauppa', 'W-Ruoka', 'Asiakasryhmä', 'Erikoisryhmä']

  return {
    name: `${getRandomFromList(names)} ${Math.floor(Math.random() * 1000)}`,
    discount: new Decimal(Math.random() * 10),
    streetAddress: maybe(getRandomFromList(streets)),
    postalCode: maybe(String(10000 + Math.floor(Math.random() * 90000))),
    city: maybe(getRandomFromList(cities)),
    phone: maybe(`0${Math.floor(100000000 + Math.random() * 900000000)}`),
    email: maybe(getRandomFromList(emails)),
    showPriceWithoutTax: Math.random() > 0.5,
    invoiceReference: maybe(String(Math.floor(1000000000 + Math.random() * 9000000000))),
    companyLegalName: maybe(`Test company ${Math.floor(Math.random() * 100)}`),
    businessId: maybe(`Y-${Math.floor(1000000 + Math.random() * 9000000)}-${Math.floor(Math.random() * 10)}`),
    customerGroup: maybe(getRandomFromList(groups)),
  }
}
