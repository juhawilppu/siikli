import MenuIcon from '@mui/icons-material/Menu'
import {
  AppBar,
  Button,
  CircularProgress,
  IconButton,
  Toolbar,
  Typography,
} from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'
import { styled } from '@mui/material/styles'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { Landing } from './Landing'
import SiikliDrawer from './SiikliDrawer'
import { PageContent } from './components'
import { CustomerPage } from './pages/CustomerPage'
import { Customers } from './pages/Customers'
import Order from './pages/Order/Order'
import { Orders } from './pages/Orders'
import { OwnCompany } from './pages/OwnCompany'
import { PackageConfiguration } from './pages/PackageConfiguration'
import { PackageList } from './pages/PackageList'
import { ProductPage } from './pages/ProductPage'
import { Products } from './pages/Products'
import { SalesReport } from './pages/SalesReport'

const WhiteButton = styled(Button)({
  backgroundColor: 'transparent', // Custom color
  color: 'white',
  padding: '10px 20px',
  '&:hover': {
    backgroundColor: '#0069D9', // Darken color on hover
  },
  // Add more styles as needed
})

axios.defaults.baseURL = 'http://localhost:5173/api'

function App() {
  const [user, setUser] = useState()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios
      .get('/auth/current-user')
      .then((response) => {
        setUser(response.data.username)
      })
      .finally(() => setLoading(false))
  })

  let routes
  if (loading) {
    routes = (
      <div style={{ marginTop: '100px' }}>
        <CircularProgress />
      </div>
    )
  } else if (user) {
    routes = (
      <Routes>
        <Route path='/' element={<Landing />} />
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    )
  } else {
    routes = (
      <Routes>
        <Route path='/' element={<Customers />} />
        <Route path='/orders' element={<Orders />} />
        <Route path='/orders/new' element={<Order />} />
        <Route path='/orders/:orderId' element={<Order />} />
        <Route path='/sales_report' element={<SalesReport />} />
        <Route path='/packaging_list' element={<PackageList />} />
        <Route path='/invoices' element={<Customers />} />
        <Route path='/customers' element={<Customers />} />
        <Route path='/customers/:customerId' element={<CustomerPage />} />
        <Route path='/customers/:customerId/:edit' element={<CustomerPage />} />
        <Route path='/products' element={<Products />} />
        <Route path='/products/:productId' element={<ProductPage />} />
        <Route path='/products/:productId/:edit' element={<ProductPage />} />
        <Route
          path='/package_configuration'
          element={<PackageConfiguration />}
        />
        <Route path='/own_company' element={<OwnCompany />} />
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    )
  }

  return (
    <>
      <CssBaseline />
      <AppBar position='fixed' style={{ zIndex: 9000 }}>
        <Toolbar>
          <IconButton
            size='large'
            edge='start'
            color='inherit'
            aria-label='menu'
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
            Siikli
          </Typography>
          {user && (
            <>
              <div>{user}</div>{' '}
              <WhiteButton href='/auth/logout' id='logout'>
                Kirjaudu ulos
              </WhiteButton>
            </>
          )}
          {!user && (
            <WhiteButton href='/auth/google' id='login'>
              Kirjaudu sisään
            </WhiteButton>
          )}
        </Toolbar>
      </AppBar>
      <SiikliDrawer />
      <PageContent>{routes}</PageContent>
    </>
  )
}

export default App
