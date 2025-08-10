import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'

import { AuthProvider } from './app/context/AuthContext'

const Landing = lazy(() => import('./landing/index'))
const MainApp = lazy(() => import('./app/index'))

export default function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/app/*" element={<AuthProvider><MainApp /></AuthProvider>} />
        <Route path="/*" element={<Landing />} />
      </Routes>
    </Suspense>
  )
}
