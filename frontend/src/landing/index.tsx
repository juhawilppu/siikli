import { Navigate, Route, Routes } from 'react-router-dom'

import { Toaster } from '@/components/ui/toaster'

import { initPosthog } from '@/lib/posthog'
import SiikliCookieConsent from '../components/SiikliCookieConsent'
import ErrorPage from './components/ErrorPage'
import AboutUs from './pages/AboutUs'
import ContactPage from './pages/Contact'
import Cookies from './pages/Cookies'
import LandingPage from './pages/Landing'
import LoginPage from './pages/LoginPage'
import PrivacyPolicy from './pages/PrivacyPolicy'
import Support from './pages/Support'
import TermsOfService from './pages/TermsOfService'

function Landing() {
  const handleCookieConsentAccept = () => {
    initPosthog()
  }

  const handleCookieConsentDecline = () => {
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/tietoa-meista" element={<AboutUs />} />
        <Route path="/yhteystiedot" element={<ContactPage />} />
        <Route path="/tietosuoja" element={<PrivacyPolicy />} />
        <Route path="/kayttoehdot" element={<TermsOfService />} />
        <Route path="/evasteet" element={<Cookies />} />
        <Route path="/kirjaudu" element={<LoginPage />} />
        <Route path="/tuki" element={<Support />} />
        <Route path="/error" element={<ErrorPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
      <SiikliCookieConsent onAccept={handleCookieConsentAccept} onDecline={handleCookieConsentDecline} />
    </>
  )
}

export default Landing
