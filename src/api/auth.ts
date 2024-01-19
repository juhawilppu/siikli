const passport = require('passport')

import express from 'express'

export const authRoute = express.Router()

authRoute.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: [
      'email',
      'profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      'openid',
    ],
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
  //req.logout()
  res.redirect('/')
})

authRoute.get('/api/auth/current-user', (req, res) => {
  res.send(req.user)
})
