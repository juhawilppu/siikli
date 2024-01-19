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
    res.redirect('/messages')
  }
)

authRoute.get('/auth/logout', (req, res) => {
  console.log('logout here')
  req.logout((err) => {
    console.log('err', err)
    res.redirect('/')
  })
})

authRoute.get('/api/auth/current-user', (req, res) => {
  if (req.user) {
    const user = req.user as any
    res.send({ username: user.username }).status(200)
  } else {
    res.status(201).end()
  }
})
