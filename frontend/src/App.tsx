import MenuIcon from '@mui/icons-material/Menu'
import {
  Alert,
  AppBar,
  Button,
  Card,
  CardContent,
  IconButton,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import axios, { AxiosError } from 'axios'
import { useEffect, useState } from 'react'
import './App.css'

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

  useEffect(() => {
    axios.get('/auth/current-user').then((response) => {
      setUser(response.data.username)
    })
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

  return (
    <>
      <AppBar position='static'>
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
            Messages
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
