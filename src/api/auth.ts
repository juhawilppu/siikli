const passport = require('passport')

import express from 'express'

export const authRoute = express.Router()

authRoute.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: ['email', 'profile'],
  })
)

authRoute.get(
  '/auth/google/callback',
  passport.authenticate('google'),
  (req, res) => {
    console.log('callback here')
    res.redirect('/')
  }
)

authRoute.post('/api/auth/logout', (req, res) => {
  console.log('logout here')
  req.logout((err) => {
    console.log('err', err)
    res.redirect('/')
  })
})

authRoute.get('/api/auth/current-user', (req, res) => {
  console.log('auth/current-user here')
  if (req.user) {
    const user = req.user as any
    res.status(200).send({ username: user.username, initials: 'JW' })
  } else {
    res.status(404).end()
  }
})
