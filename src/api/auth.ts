const passport = require('passport')

import express from 'express'

export const authRoute = express.Router()

authRoute.get(
  '/api/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
)

authRoute.get(
  '/api/auth/google/callback',
  passport.authenticate('google'),
  (req, res) => {
    res.redirect('/messages')
  }
)

authRoute.get('/api/auth/logout', (req, res) => {
  //req.logout()
  res.redirect('/')
})

authRoute.get('/api/auth/current-user', (req, res) => {
  res.send(req.user)
})
