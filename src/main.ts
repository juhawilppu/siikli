import cookieSession from 'cookie-session'
import cors from 'cors'
import express from 'express'
import passport from 'passport'
import { exit } from 'process'
import { authRoute } from './api/auth'
import { postsRoute } from './api/posts'

const app = express()

if (process.env.NODE_ENV !== 'production') {
  app.use(cors())
}

app.use(express.json({ limit: '200kb' }))
app.use(authRoute)
app.use(postsRoute)

const cookieEncryptionKey = process.env.COOKIE_ENCRYPTION_KEY

if (!cookieEncryptionKey || cookieEncryptionKey.length < 32) {
  console.error('COOKIE_ENCRYPTION_KEY missing or too weak')
  exit(1)
}

app.use(
  cookieSession({
    maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
    keys: [cookieEncryptionKey],
  })
)

app.use(passport.initialize())
app.use(passport.session())

if (process.env.NODE_ENV === 'production') {
  // Express will serve the client main.js etc.
  app.use(express.static('client/build'))

  // Express will redirect to / if it's doesn't recognize the route
  const path = require('path')
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
  })
}

const server = app.listen(3000, () => {
  console.log(`🚀 Server ready at: http://localhost:3000`)
  console.log(
    `⭐️ See sample requests: http://pris.ly/e/ts/rest-express#3-using-the-rest-api`
  )
})
