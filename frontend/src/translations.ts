import { useApp } from './context/AppContext'

export const translations = {
  fi: {
    'landing.title': 'Hallitse liiketoimintaasi tehokkaasti Siikli ERP:llä',
  },
  en: {
    'landing.title': 'Siikli – The Simple ERP for Agriculture',
  },
}

export function useTranslation() {
  const { language } = useApp()

  return (key: keyof typeof translations[typeof language]) => {
    return translations[language][key]
  }
}
