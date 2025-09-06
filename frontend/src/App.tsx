import { Suspense } from 'react'

import { AuthProvider } from './app/context/AuthContext'
import LoginOrApp from './LoginOrApp'

export default function App() {
  return (
    <Suspense fallback={null}>
      <AuthProvider><LoginOrApp /></AuthProvider>
    </Suspense>
  )
}
