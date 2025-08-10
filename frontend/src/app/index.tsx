import axios from 'axios'
import { Building2, ClipboardList, FileText, HelpCircle, LineChart, PlusCircle, Receipt, Search, ShoppingBasket, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Navigate, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import CompanySettings from '@/app/pages/CompanySettings.js'
import { Customers } from '@/app/pages/Customers/Customers.js'
import { Invoices } from '@/app/pages/Invoices.js'
import Order from '@/app/pages/Orders/OrderForm.js'
import Orders from '@/app/pages/Orders/Orders.js'
import { PackagingList } from '@/app/pages/PackagingList/PackagingList.js'
import Products from '@/app/pages/Products/Products.js'
import TuoteryhmatJarjestely from '@/app/pages/Products/ProductTypeReorder.js'
import { SalesReport } from '@/app/pages/SalesReport.js'
import SelfSignup from '@/app/pages/SelfSignup.js'
import LanguageSwitcher from '@/components/LanguageSwitcher.js'
import SiikliCookieConsent from '@/components/SiikliCookieConsent'
import { Button } from '@/components/ui/button.js'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu.js'
import { Input } from '@/components/ui/input.js'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Toaster } from '@/components/ui/toaster.js'

import { initPosthog } from '@/lib/posthog'
import { useAuth } from './context/AuthContext'
import Support from './pages/Support'

axios.defaults.baseURL = '/api'

const navItems = [
  // { title: "Etusivu", href: '/', icon: Home },
  { title: 'Tilaukset', href: '/app/orders', icon: ClipboardList },
  { title: 'Uusi tilaus', href: '/app/orders/new', icon: PlusCircle },
  { title: 'Pakkauslista', href: '/app/packaging-list', icon: FileText },
  { title: 'Laskut', href: '/app/invoices', icon: Receipt },
  { title: 'Myyntiraportti', href: '/app/sales-report', icon: LineChart },
  { title: 'Tuotteet', href: '/app/products', icon: ShoppingBasket },
  { title: 'Asiakkaat', href: '/app/customers', icon: Users },
  { title: 'Oma yritys', href: '/app/own-company', icon: Building2 },
]

function App() {
  const navigate = useNavigate()
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

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
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 bg-gradient-to-b from-blue-600 via-blue-600 to-blue-700 text-white px-4 md:px-6 shadow-lg">
            <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="md:hidden bg-transparent text-white hover:bg-white/10 border border-gray-300"
                >
                  <Menu className="h-5 w-5 text-white" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="md:hidden">
                <MobileSidebar setIsMobileNavOpen={setIsMobileNavOpen} />
              </SheetContent>
            </Sheet>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-white">Siikli</span>
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
                  navigate('/app/support')
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
                  <DropdownMenuItem onClick={() => {
                    navigate('/app/support')
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
          <div className="flex flex-1">
            {/* Desktop Sidebar */}
            <aside className="hidden w-64 shrink-0 border-r border-slate-300 bg-gradient-to-b from-slate-100 to-slate-200 md:block">
              <DesktopSidebar currentPath={location.pathname} />
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
              <Routes>
                <Route path="/" element={<Navigate to="/app/orders" replace />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/orders/new" element={<Order key="new" />} />
                <Route path="/orders/:orderId" element={<Order key="edit" />} />
                <Route path="/sales-report" element={<SalesReport />} />
                <Route path="/packaging-list" element={<PackagingList />} />
                <Route path="/invoices" element={<Invoices />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/reorder" element={<TuoteryhmatJarjestely />} />
                <Route path="/support" element={<Support />} />
                <Route path="/own-company" element={<CompanySettings />} />
                <Route path="*" element={<Navigate to="/app/orders" replace />} />
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
        <span>Siikli</span>
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
              className={`flex items-center gap-3 rounded-full px-3 py-2 transition-all ${
                currentPath === item.href
                  ? 'bg-gray-300 text-black font-semibold [&>svg]:text-black'
                  : 'text-gray-700 hover:text-muted-foreground hover:bg-gray-100'
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
