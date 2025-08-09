// src/context/AppContext.tsx
import type { GetCurrentUserDto } from '@/types/types'
import * as Sentry from '@sentry/react'
import axios from 'axios'
import React, { createContext, useContext, useEffect, useState } from 'react'

const DEFAULT_LANGUAGE = 'fi'
type Language = 'fi' | 'en'
type Variant = 'A' | 'B'

interface AppContextType {
  language: Language
  variant: 'A' | 'B'
  setLanguage: (lang: Language) => void
  user: GetCurrentUserDto | undefined
  logout: () => Promise<void>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(localStorage.getItem('language') as Language || DEFAULT_LANGUAGE)
  const [user, setUser] = useState<GetCurrentUserDto>()
  // const [variant, _] = useState<Variant>('A' || localStorage.getItem('variant') as Variant)
  const [variant, _] = useState<Variant>('A')

  const logout = async () => {
    await axios.post('/auth/logout')
    setUser({ authenticated: false })
    Sentry.setUser(null)
  }

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

  useEffect(() => {
    axios
      .get<GetCurrentUserDto>('/auth/current-user')
      .then((response) => {
        const userData = response.data
        if (userData.authenticated) {
          setUser(userData)
          // Update Sentry user context
          Sentry.setUser({
            id: userData.userId,
            initials: userData.initials,
            tenantId: userData.tenantId,
          })
        }
        else {
          setUser({ authenticated: false })
        }
      })
  }, [])

  const updateLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
  }

  return (
    <AppContext.Provider value={{ language, setLanguage: updateLanguage, variant, user, logout }}>
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
