const passport = require('passport')

import { PrismaClient } from '@prisma/client'
import express from 'express'
const prisma = new PrismaClient()
export const authRoute = express.Router()

authRoute.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: ['email', 'profile'],
  })
)

authRoute.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/error' }),
  (req, res, next) => {
    try {
      console.log('callback here')
      res.redirect('/')
    } catch (error) {
      console.log('login error', error)
      next(error)
    }
  }
)

authRoute.post('/api/auth/email/create-pin', async (req, res, next) => {
  const body = req.body
  console.log(body)
  const pin = Math.floor(100000 + Math.random() * 900000)
  console.log('pin', pin)
  await prisma.emailLoginPinCode.deleteMany({
    where: {
      email: body.email,
    },
  })
  await prisma.emailLoginPinCode.create({
    data: {
      email: body.email,
      pinCode: pin.toString(),
    },
  })
  console.log(`pin ${pin} sent to email ${body.email}`)
  res.status(200).json({ message: 'OK' })
})

authRoute.post('/api/auth/email/check-pin', passport.authenticate('local', {
  failureMessage: true,
  session: false
}), (req, res, next) => {
  try {
    console.log('callback here')
    res.redirect('/')
  } catch (error) {
    console.log('login error', error)
    next(error)
  }
})

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
