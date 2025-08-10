import React, { createContext, useContext, useEffect, useState } from 'react'

const DEFAULT_LANGUAGE = 'fi'
type Language = 'fi' | 'en'
type Variant = 'A' | 'B'

interface AppContextType {
  language: Language
  variant: 'A' | 'B'
  setLanguage: (lang: Language) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(localStorage.getItem('language') as Language || DEFAULT_LANGUAGE)

  // Disable A/B testing for now.
  // const [variant, _] = useState<Variant>('A' || localStorage.getItem('variant') as Variant)
  const [variant, _] = useState<Variant>('A')

  useEffect(() => {
    if (variant === 'A') {
      if (language === 'en') {
        document.title = 'Siikli | Down-to-earth software'
        document.documentElement.lang = 'en'
      }
      else {
        document.title = 'Siikli | Tehty maalaisjärjellä'
        document.documentElement.lang = 'fi'
      }
    }
    else {
      if (language === 'en') {
        document.title = 'Siikli | Made for business'
        document.documentElement.lang = 'en'
      }
      else {
        document.title = 'Siikli | Tehty tarpeeseen'
        document.documentElement.lang = 'fi'
      }
    }
  }, [language])

  useEffect(() => {
    if (variant) {
      localStorage.setItem('variant', variant)
    }
  }, [variant])

  const updateLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
  }

  return (
    <AppContext.Provider value={{ language, setLanguage: updateLanguage, variant }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context)
    throw new Error('useApp must be used within AppProvider')
  return context
}
