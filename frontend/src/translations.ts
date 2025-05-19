import { useApp } from './context/AppContext'

export const translations = {
  fi: {
    'landing.title': 'Hallitse liiketoimintaasi tehokkaasti Siikli ERP:llä',
    'landing.description': 'Siikli on helppokäyttöinen toiminnanohjausjärjestelmä, joka on suunniteltu erityisesti suomalaisten pienyritysten tarpeisiin.',
    'landing.description2': '🎉 Ensimmäiset käyttäjät saavat 3 kuukautta täysin ilmaiseksi. Haen palautetta ja kehityskohteita – saat täyden version maksutta ja autat samalla tekemään siitä entistä paremman.',
    'landing.startForFree': 'Aloita ilmaiseksi',
    'landing.learnMore': 'Tutustu ominaisuuksiin',
    'landing.features.title': 'Kaikki mitä tarvitset liiketoimintasi hallintaan',
    'landing.features.description': 'Siikli tarjoaa kattavat työkalut yrityksesi toiminnan tehostamiseen ja hallintaan.',
    'landing.features.ordersTitle': 'Tilausten hallinta',
    'landing.features.ordersDescription': 'Hallitse tilauksia helposti, seuraa toimituksia ja pidä asiakkaat ajan tasalla.',
    'landing.topbar.back': 'Takaisin etusivulle',
    'landing.topbar.login': 'Kirjaudu sisään',
    'landing.topbar.contact': 'Yhteystiedot',
    'landing.topbar.support': 'Tuki',
    'landing.topbar.pricing': 'Hinnoittelu',
    'landing.topbar.features': 'Ominaisuudet',
  },
  en: {
    'landing.title': 'Siikli – The Simple ERP for Agriculture',
    'landing.description': 'Siikli is a user-friendly business management system designed specifically for Finnish small businesses.',
    'landing.description2': '🎉 First users get 3 months for free. I am seeking feedback and development ideas – you get the full version for free and help make it even better.',
    'landing.startForFree': 'Start for free',
    'landing.learnMore': 'Learn more',
    'landing.features.title': 'All you need to manage your business',
    'landing.features.description': 'Siikli offers comprehensive tools to help you manage your business.',
    'landing.features.ordersTitle': 'Order management',
    'landing.features.ordersDescription': 'Manage orders easily, track shipments, and keep customers updated.',
    'landing.topbar.back': 'Back to home',
    'landing.topbar.login': 'Login',
    'landing.topbar.contact': 'Contact',
    'landing.topbar.support': 'Support',
    'landing.topbar.pricing': 'Pricing',
    'landing.topbar.features': 'Features',
  },
}

export function useTranslation() {
  const { language } = useApp()

  return (key: keyof typeof translations[typeof language]) => {
    return translations[language][key]
  }
}
