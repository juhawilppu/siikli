import type { GetCurrentUserDto } from './types/types'
import * as Sentry from '@sentry/react'
import axios from 'axios'
import { Building2, ClipboardList, FileText, HelpCircle, LineChart, PlusCircle, Receipt, Search, ShoppingBasket, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Navigate, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import AboutUs from './AboutUs'
import LanguageSwitcher from './components/LanguageSwitcher'
import { Button } from './components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './components/ui/dropdown-menu'
import { Input } from './components/ui/input'
import { Toaster } from './components/ui/toaster'
import ContactPage from './Contact'
import { useApp } from './context/AppContext'
import Cookies from './Cookies'
import ErrorPage from './ErrorPage'
import Landing from './Landing'
import LoginPage2 from './LoginPage'
import CompanySettings from './pages/CompanySettings'
import { CustomerPage } from './pages/CustomerPage'
import { Customers } from './pages/Customers'
import { Invoices } from './pages/Invoices'
import Order from './pages/Order/Order'
import Orders from './pages/Orders'
import { PackageConfiguration } from './pages/PackageConfiguration'

import { PackagingList } from './pages/PackagingList'
import Products from './pages/Products'
import TuoteryhmatJarjestely from './pages/ProductTypeReorder'
import { SalesReport } from './pages/SalesReport'
import SelfSignup from './pages/SelfSignup'
import { initPosthog } from './posthog'
import PrivacyPolicy from './PrivacyPolicy'
import SiikliCookieConsent from './SiikliCookieConsent'
import Support from './Support'
import TermsOfService from './TermsOfService'
import './App.css'

axios.defaults.baseURL = '/api'

const navItems = [
  // { title: "Etusivu", href: '/', icon: Home },
  { title: 'Tilaukset', href: '/orders', icon: ClipboardList },
  { title: 'Uusi tilaus', href: '/orders/new', icon: PlusCircle },
  { title: 'Pakkauslista', href: '/packaging-list', icon: FileText },
  { title: 'Laskut', href: '/invoices', icon: Receipt },
  { title: 'Myyntiraportti', href: '/sales-report', icon: LineChart },
  { title: 'Tuotteet', href: '/products', icon: ShoppingBasket },
  { title: 'Asiakkaat', href: '/customers', icon: Users },
  { title: 'Oma yritys', href: '/own-company', icon: Building2 },
]

function App() {
  const navigate = useNavigate()
  const [user, setUser] = useState<GetCurrentUserDto>()
  const [loading, setLoading] = useState(true)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  const location = useLocation()

  const logout = async () => {
    await axios.post('/auth/logout')
    setUser({ authenticated: false })
    Sentry.setUser(null)
  }

  const handleCookieConsentAccept = () => {
    initPosthog()
    localStorage.setItem('cookie-consent', 'accepted')
  }

  const handleCookieConsentDecline = () => {
    localStorage.setItem('cookie-consent', 'declined')
  }

  // If user has already given consent, initialize PostHog
  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (consent === 'accepted') {
      initPosthog()
    }
  }, [])

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
      .finally(() => setLoading(false))
  }, [])

  if (loading || user === undefined) {
    return (
      <div style={{ marginTop: '100px' }}>
        <div></div>
      </div>
    )
  }
  else if (!user.authenticated) {
    return (
      <>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/tietoa-meista" element={<AboutUs />} />
          <Route path="/yhteystiedot" element={<ContactPage />} />
          <Route path="/tietosuoja" element={<PrivacyPolicy />} />
          <Route path="/kayttoehdot" element={<TermsOfService />} />
          <Route path="/evasteet" element={<Cookies />} />
          <Route path="/kirjaudu" element={<LoginPage2 />} />
          <Route path="/tuki" element={<Support />} />
          <Route path="/error" element={<ErrorPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
        <SiikliCookieConsent onAccept={handleCookieConsentAccept} onDecline={handleCookieConsentDecline} />
      </>
    )
  }
  else if (user.authenticated && !user.signupCompleted) {
    return (
      <>
        <Routes>
          <Route path="*" element={<SelfSignup />} />
        </Routes>
      </>
    )
  }
  else {
    return (
      <>
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 bg-gradient-to-b from-blue-600 via-blue-600 to-blue-700 text-white px-4 md:px-6 shadow-lg">
            <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5 text-black" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="md:hidden">
                <MobileSidebar setIsMobileNavOpen={setIsMobileNavOpen} />
              </SheetContent>
            </Sheet>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-white">Siikli ERP</span>
            </div>
            <div className="ml-auto flex items-center gap-4">
              {false && (
                <form className="hidden md:block">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-blue-200" />
                    <Input
                      type="search"
                      placeholder="Etsi..."
                      className="w-64 rounded-lg bg-blue-700 border-blue-500 text-white placeholder:text-blue-200 pl-8 md:w-80"
                    />
                  </div>
                </form>
              )}
              <LanguageSwitcher inApp />
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  navigate('/support')
                }}
                className="rounded-full bg-blue-700 border-blue-500 text-white hover:bg-blue-800 hover:text-white"
              >
                <HelpCircle className="h-5 w-5" />
                <span className="sr-only">Tuki</span>
              </Button>
              {false && (
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full bg-blue-700 border-blue-500 text-white hover:bg-blue-800 hover:text-white"
                >
                  <Bell className="h-5 w-5" />
                  <span className="sr-only">Ilmoitukset</span>
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full bg-blue-700 border-blue-500 hover:bg-blue-800 text-white hover:text-white"
                  >
                    {user?.initials}
                    <span className="sr-only">Toggle user menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Tunnukseni</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profiili</DropdownMenuItem>
                  <DropdownMenuItem>Asetukset</DropdownMenuItem>
                  <DropdownMenuItem>Tuki</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>Kirjaudu ulos</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <div className="flex flex-1">
            {/* Desktop Sidebar */}
            <aside className="hidden w-64 shrink-0 border-r border-slate-300 bg-gradient-to-b from-slate-100 to-slate-200 md:block">
              <DesktopSidebar currentPath={location.pathname} />
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
              <Routes>
                <Route path="/" element={<Navigate to="/orders" replace />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/orders/new" element={<Order key="new" />} />
                <Route path="/orders/:orderId" element={<Order key="edit" />} />
                <Route path="/sales-report" element={<SalesReport />} />
                <Route path="/packaging-list" element={<PackagingList />} />
                <Route path="/invoices" element={<Invoices />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/customers/:customerId" element={<CustomerPage />} />
                <Route path="/customers/:customerId/:edit" element={<CustomerPage />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/reorder" element={<TuoteryhmatJarjestely />} />
                <Route path="/support" element={<Support inApp />} />
                <Route
                  path="/package_configuration"
                  element={<PackageConfiguration />}
                />
                <Route path="/own-company" element={<CompanySettings />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
          <Toaster />
          <SiikliCookieConsent onAccept={handleCookieConsentAccept} onDecline={handleCookieConsentDecline} />
        </div>
      </>
    )
  }
}

export default App

function MobileSidebar({ setIsMobileNavOpen }: { setIsMobileNavOpen: (isOpen: boolean) => void }) {
  const { variant } = useApp()
  return (
    <div className="flex h-full flex-col gap-2 overflow-auto">
      <div className="flex h-14 items-center border-b px-4">
        <NavLink href="/" className="flex items-center gap-2 font-semibold">
          <img src={`/siikli-logo-${variant}.png`} className="h-6" />
          <span>Siikli ERP</span>
        </NavLink>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {navItems.map(item => (
            <NavLink
              to={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground"
              onClick={() => {
                setIsMobileNavOpen(false)
              }}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}

// Desktop Sidebar Component
function DesktopSidebar({ currentPath }: { currentPath: string }) {
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {navItems.map(item => (
            <NavLink
              to={item.href}
              key={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${currentPath === item.href ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}

// Menu icon component
function Menu(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  )
}

// Bell icon component
function Bell(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  )
}
