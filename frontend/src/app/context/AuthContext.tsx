import type { GetCurrentUserDto } from '@siikli/shared'
import * as Sentry from '@sentry/react'
import axios from 'axios'
import React, { createContext, useContext, useEffect, useState } from 'react'

interface AuthContextType {
  user: GetCurrentUserDto | undefined
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<GetCurrentUserDto>()

  const logout = async () => {
    await axios.post('/auth/logout')
    setUser({ authenticated: false })
    Sentry.setUser(null)
  }

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

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context)
    throw new Error('useAuth must be used within AuthProvider')
  return context
}
