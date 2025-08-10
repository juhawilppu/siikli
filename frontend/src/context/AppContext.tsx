import React, { createContext, useContext, useEffect, useState } from 'react'

const DEFAULT_LANGUAGE = 'fi'
type Language = 'fi' | 'en'

interface AppContextType {
  language: Language
  setLanguage: (lang: Language) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(localStorage.getItem('language') as Language || DEFAULT_LANGUAGE)

  useEffect(() => {
    if (language === 'en') {
      document.title = 'Siikli | Made with common sense'
      document.documentElement.lang = 'en'
    }
    else {
      document.title = 'Siikli | Tehty maalaisjärjellä'
      document.documentElement.lang = 'fi'
    }
  }, [language])

  const updateLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
  }

  return (
    <AppContext.Provider value={{ language, setLanguage: updateLanguage }}>
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
