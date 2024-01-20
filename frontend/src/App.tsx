import MenuIcon from '@mui/icons-material/Menu'
import {
  Alert,
  AppBar,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import axios, { AxiosError } from 'axios'
import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { Landing } from './Landing'
import SiikliDrawer from './SiikliDrawer'
import { CustomerPage } from './pages/CustomerPage'
import { Customers } from './pages/Customers'
import { Order } from './pages/Order'
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
  const [posts, setPosts] = useState<{ title: string; content: string }[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isMessageSent, setIsMessageSent] = useState(false)
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

  useEffect(() => {
    axios.get('/posts').then((response) => {
      setPosts(response.data)
    })
  }, [])

  const save = async () => {
    try {
      await axios.post('/posts', {
        title,
        content,
      })
      setTitle('')
      setContent('')
      setIsMessageSent(true)
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response?.status === 429) {
        alert('Rate limit reached, try again later')
      }
    }
  }

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
        <Route path='/orders/:orderId' element={<Order />} />
        <Route path='/orders/:orderId/:edit' element={<Order />} />
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
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: 80,
          marginBottom: 100,
          paddingLeft: 200,
        }}
      >
        {routes}
      </div>
      <div className='content-wrapper'>
        <div className='content'>
          <h1>Juulia Stack</h1>
          <div className='card'>
            {isMessageSent && <Alert severity='success'>Message sent!</Alert>}
            {posts.map((post) => (
              <Card>
                <CardContent>
                  <h3>{post.title}</h3>
                  <div>{post.content}</div>
                </CardContent>
              </Card>
            ))}
            <h2>Send new message</h2>
            <TextField
              variant='outlined'
              label='Title'
              type='text'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <br />
            <TextField
              variant='outlined'
              label='Content'
              type='text'
              rows={10}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <br />
            <Button variant='contained' onClick={save}>
              Save
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
