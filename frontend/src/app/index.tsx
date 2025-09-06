import { Building2, Check, ClipboardList, FileText, HelpCircle, LineChart, Receipt, Search, ShoppingBasket, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Navigate, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useIsMobile } from '@/app/hooks/use-mobile'
import CompanySettings from '@/app/pages/CompanySettings'
import { Customers } from '@/app/pages/Customers/Customers'
import Order from '@/app/pages/Orders/OrderForm'
import Orders from '@/app/pages/Orders/Orders'
import { PackagingList } from '@/app/pages/PackagingList/PackagingList'
import Products from '@/app/pages/Products/Products'
import { SalesReport } from '@/app/pages/SalesReport'
import SelfSignup from '@/app/pages/SelfSignup'
import { SentInvoices } from '@/app/pages/SentInvoices'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import SiikliCookieConsent from '@/components/SiikliCookieConsent'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Toaster } from '@/components/ui/toaster'
import { initPosthog } from '@/lib/posthog'
import { Bell, Menu } from './components/custom-icons'
import { useAuth } from './context/AuthContext'
import Invoices from './pages/Invoices'
import Onboarding from './pages/Onboarding'
import Support from './pages/Support'
import Waybills from './pages/Waybills'

const navItems = [
  { title: 'Käyttöönotto', href: '/onboarding', icon: Check },
  { title: 'Tilaukset', href: '/orders', icon: ClipboardList },
  { title: 'Pakkauslista', href: '/packaging-list', icon: FileText },
  { title: 'Kuormakirjat', href: '/waybills', icon: Receipt },
  { title: 'Laskut', href: '/invoices', icon: Receipt },
  { title: 'Lähetetyt laskut', href: '/sent-invoices', icon: Receipt },
  { title: 'Myyntiraportti', href: '/sales-report', icon: LineChart },
  { title: 'Tuotteet', href: '/products', icon: ShoppingBasket },
  { title: 'Asiakkaat', href: '/customers', icon: Users },
  { title: 'Oma yritys', href: '/own-company', icon: Building2 },
]

function App() {
  const navigate = useNavigate()
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const isMobile = useIsMobile()

  const location = useLocation()

  const { user, logout } = useAuth()

  const handleCookieConsentAccept = () => {
    initPosthog()
  }

  const handleCookieConsentDecline = () => {
  }

  // If user has already given consent, initialize PostHog
  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (consent === 'accepted') {
      initPosthog()
    }
  }, [])

  if (user === undefined) {
    return (
      <div style={{ marginTop: '100px' }}>
        <div></div>
      </div>
    )
  }
  else if (!user.authenticated) {
    return <Navigate to="/" replace />
  }
  else if (!user.signupCompleted) {
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
          <header
            className="fixed top-0 left-0 right-0 z-40 flex h-16 items-center gap-4 bg-gradient-to-b from-blue-600 via-blue-600 to-blue-700 text-white px-4 md:px-6 shadow-lg"
            style={{
              width: '100%',
            }}
          >
            <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className={`${isMobile ? '' : 'hidden'} bg-transparent text-white hover:bg-white/10 border border-gray-300`}
                >
                  <Menu className="h-5 w-5 text-white" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className={`${isMobile ? '' : 'hidden'}`}>
                <MobileSidebar setIsMobileNavOpen={setIsMobileNavOpen} />
              </SheetContent>
            </Sheet>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-white">Siikli</span>
            </div>
            <div className="ml-auto flex items-center gap-4">
              <LanguageSwitcher />
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
                  <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => {
                    navigate('/support')
                  }}
                  >
                    Tuki
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>Kirjaudu ulos</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <div className="flex flex-1 min-h-0" style={{ paddingTop: '4rem' }}>
            {/* Desktop Sidebar */}
            <aside
              className="hidden md:block w-64 shrink-0 border-r border-slate-300 bg-gradient-to-b from-slate-100 to-slate-200"
              style={{
                zIndex: 20,
                position: 'fixed',
                top: '64px', // header height (h-16 = 4rem = 64px)
                left: 0,
                height: 'calc(100vh - 64px)',
                overflow: 'visible',
              }}
            >
              <div className="flex flex-col h-full">
                <DesktopSidebar currentPath={location.pathname} />
              </div>
            </aside>

            {/* Main Content */}
            <main
              className={`flex-1 overflow-auto min-h-0 ${isMobile ? 'ml-0' : 'ml-64'}`}
            >
              <Routes>
                <Route path="/" element={<Navigate to="/orders" replace />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/orders/new" element={<Order key="new" />} />
                <Route path="/orders/:orderId" element={<Order key="edit" />} />
                <Route path="/waybills" element={<Waybills />} />
                <Route path="/sales-report" element={<SalesReport />} />
                <Route path="/packaging-list" element={<PackagingList />} />
                <Route path="/invoices" element={<Invoices />} />
                <Route path="/sent-invoices" element={<SentInvoices />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/products" element={<Products />} />
                <Route path="/support" element={<Support />} />
                <Route path="/own-company" element={<CompanySettings />} />
                <Route path="*" element={<Navigate to="/orders" replace />} />
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
  return (
    <div className="flex h-full flex-col gap-2 overflow-auto">
      <div className="flex h-14 items-center border-b px-4">
        <img src="/siikli-logo.webp" className="h-6" />
        <span className="text-lg font-semibold text-black pl-2">Siikli</span>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {navItems.map(item => (
            <NavLink
              key={item.href}
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
              className={`flex items-center gap-3 rounded-full px-3 py-2 transition-all ${
                currentPath.startsWith(item.href)
                  ? 'bg-blue-200 text-black font-semibold [&>svg]:text-black'
                  : 'text-gray-700 hover:text-muted-foreground hover:bg-blue-100'
              }`}
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
