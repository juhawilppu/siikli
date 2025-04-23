const passport = require('passport')

import { PrismaClient } from '@prisma/client'
import express from 'express'
import { GetCurrentUserDto } from '../../frontend/src/types/types'
import { rateLimit } from '../../middlewares/rateLimit'
import { UserWithTenant } from '../passportConfig'
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

authRoute.post('/api/auth/email/create-pin', rateLimit(5, 10), async (req, res, next) => {
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

authRoute.post('/api/auth/email/check-pin', rateLimit(10, 1), passport.authenticate('local'), (req, res, next) => {
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
    const user = req.user as UserWithTenant
    const initials = user.email
      .split('@')[0] // Take part before @
      .includes('.')
      ? user.email
        .split('@')[0]
        .split('.')
        .map(part => part[0])
        .join('')
        .toUpperCase()
      : user.email
        .split('@')[0]
        .slice(0, 2)
        .toUpperCase()
    res.status(200).send({ userId: user.id, tenantId: user.tenantId, initials, signupCompleted: user.tenant.signupCompleted } satisfies GetCurrentUserDto)
  } else {
    res.status(404).end()
  }
})
