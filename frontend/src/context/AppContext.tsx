// src/context/AppContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react'

const DEFAULT_LANGUAGE = 'fi'
type Language = 'fi' | 'en'

interface AppContextType {
  language: Language
  setLanguage: (lang: Language) => void
  user: null | {
    userId: string
    tenantId: string
    initials: string
    signupCompleted: boolean
  }
  setUser: (user: AppContextType['user']) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(localStorage.getItem('language') as Language || DEFAULT_LANGUAGE)
  const [user, setUser] = useState<AppContextType['user']>(null)

  useEffect(() => {
    if (language === 'en') {
      document.title = 'Siikli ERP | Down-to-earth software'
      document.documentElement.lang = 'en'
    }
    else {
      document.title = 'Siikli ERP | Tehty maalaisjärjellä'
      document.documentElement.lang = 'fi'
    }
  }, [language])

  const updateLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
  }

  return (
    <AppContext.Provider value={{ language, setLanguage: updateLanguage, user, setUser }}>
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
