import {
  CircularProgress
} from '@mui/material'
import axios from 'axios'
import { HelpCircle, LogOut, Search, Settings, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { Landing } from './Landing'
import SiikliDrawer from './SiikliDrawer'
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar'
import { Button } from './components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './components/ui/dropdown-menu'
import { Input } from './components/ui/input'
import { SidebarInset, SidebarProvider, SidebarTrigger } from './components/ui/sidebar'
import { Toaster } from './components/ui/toaster'
import CompanySettings from './pages/CompanySettings'
import { CustomerPage } from './pages/CustomerPage'
import { Customers } from './pages/Customers'
import { Dashboard } from './pages/Dashboard'
import { Invoices } from './pages/Invoices'
import NewCustomerForm from './pages/NewCustomer'
import NewProduct from './pages/NewProduct'
import Order from './pages/Order/Order'
import { Orders } from './pages/Orders'
import { PackageConfiguration } from './pages/PackageConfiguration'
import { PackageList } from './pages/PackageList'
import { ProductPage } from './pages/ProductPage'
import { Products } from './pages/Products'
import { SalesReport } from './pages/SalesReport'


axios.defaults.baseURL = 'http://localhost:5173/api'

function App() {
  const [user, setUser] = useState<{ username: string, initials: string }>()
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const logout = async () => {
    await axios.post('/auth/logout')
    setUser(undefined)
  }

  useEffect(() => {
    axios
      .get('/auth/current-user')
      .then((response) => {
        setUser(response.data)
      })
      .finally(() => setLoading(false))
  }, [])

  let routes
  if (loading) {
    routes = (
      <div style={{ marginTop: '100px' }}>
        <CircularProgress />
      </div>
    )
  } else if (!user) {
    routes = (
      <Routes>
        <Route path='/' element={<Landing />} />
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    )
  } else {
    routes = (
      <Routes>
        <Route path='/' element={<Dashboard />} />
        <Route path='/orders' element={<Orders />} />
        <Route path='/orders/new' element={<Order />} />
        <Route path='/orders/:orderId' element={<Order />} />
        <Route path='/sales-report' element={<SalesReport />} />
        <Route path='/packaging-list' element={<PackageList />} />
        <Route path='/invoices' element={<Invoices />} />
        <Route path='/customers' element={<Customers />} />
        <Route path='/customers/new' element={<NewCustomerForm />} />
        <Route path='/customers/:customerId' element={<CustomerPage />} />
        <Route path='/customers/:customerId/:edit' element={<CustomerPage />} />
        <Route path='/products' element={<Products />} />
        <Route path='/products/new' element={<NewProduct />} />
        <Route path='/products/:productId' element={<ProductPage />} />
        <Route path='/products/:productId/:edit' element={<ProductPage />} />
        <Route
          path='/package_configuration'
          element={<PackageConfiguration />}
        />
        <Route path='/own-company' element={<CompanySettings />} />
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    )
  }

  return (
    <>
      <SidebarProvider>
        {user && <SiikliDrawer />
        }
        <SidebarInset>
          <div className="flex flex-col w-full">
            {/* Top bar */}
            <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
              <SidebarTrigger />
              <div className="flex-1 flex items-center justify-between">
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search orders, invoices, customers..."
                    className="w-full pl-8 md:w-[300px] lg:w-[400px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder-user.jpg" alt="User" />
                        <AvatarFallback>{user?.initials}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Oma tili</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profiili</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Asetukset</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem>
                      <HelpCircle className="mr-2 h-4 w-4" />
                      <span>Ohje</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Kirjaudu ulos</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>
            <main className="flex-1 overflow-auto p-6">
              <div className="space-y-6"></div>
              {routes}
            </main>
          </div>
        </SidebarInset>
        <Toaster />
      </SidebarProvider>
    </>
  )
}

export default App
