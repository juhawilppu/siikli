import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import session from 'express-session'
import helmet from 'helmet'
import passport from 'passport'
import { exit } from 'process'
import { authRoute } from './api/auth'
import { ordersRoute } from './api/orders'
import { postsRoute } from './api/posts'
import passportConfig from './passportConfig'

const app = express()
app.use(helmet())
app.disable('x-powered-by')

passportConfig()

if (process.env.NODE_ENV !== 'production') {
  app.use(cors())
}

app.use('/api/', (req, res, next) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate')
  res.set('Pragma', 'no-cache')
  res.set('Expires', '0')
  next()
})
app.use('/auth/', (req, res, next) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate')
  res.set('Pragma', 'no-cache')
  res.set('Expires', '0')
  next()
})

app.use(express.json({ limit: '200kb' }))
app.use(postsRoute)
app.use(ordersRoute)

const cookieEncryptionKey = process.env.COOKIE_ENCRYPTION_KEY

if (!cookieEncryptionKey || cookieEncryptionKey.length < 32) {
  console.error('COOKIE_ENCRYPTION_KEY missing or too weak')
  exit(1)
}

app.use(cookieParser()) // For parsing cookies
app.set('trust proxy', 1) // trust first proxy

const expiryDate = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

app.use(
  session({
    secret: 'your secret', // Replace with a real secret key
    name: 'siikli-session',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      httpOnly: false,
      domain: 'localhost',
      path: '/',
      expires: expiryDate,
    },
  })
)
app.use(express.urlencoded({ extended: false })) // For parsing application/x-www-form-urlencoded

app.use(passport.initialize())
app.use(passport.session())
app.use(authRoute)

if (process.env.NODE_ENV === 'production') {
  // Express will serve the client main.js etc.
  app.use(express.static('client/build'))

  // Express will redirect to / if it's doesn't recognize the route
  const path = require('path')
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
  })
}

// custom 404
app.use((req, res, next) => {
  res.status(404).send("Sorry can't find that!")
})

// custom error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack)
  res.status(500).send('Something went wrong')
})

const server = app.listen(3000, () => {
  console.log(`🚀 Server ready at: http://localhost:3000`)
  console.log(
    `⭐️ See sample requests: http://pris.ly/e/ts/rest-express#3-using-the-rest-api`
  )
})
