import type { GetCurrentUserDto } from '@siikli/shared'
import type { UserWithTenant } from '../passportConfig'
import express from 'express'
import passport from 'passport'
import { rateLimit } from '../middlewares/rate-limit'
import { AuthService } from '../services/auth-service'

export const authRoute = express.Router()

authRoute.get(
  '/api/auth/google',
  passport.authenticate('google', {
    scope: ['email', 'profile'],
  }),
)

authRoute.get(
  '/api/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/error' }),
  (req, res, next) => {
    try {
      console.log('callback here')
      res.redirect('/')
    }
    catch (error) {
      console.log('login error', error)
      next(error)
    }
  },
)

authRoute.post('/api/auth/email/create-pin', rateLimit(5, 15), async (req, res, next) => {
  try {
    const body = req.body

    if (!body.email) {
      return res.status(400).json({ message: 'Email is required' })
    }

    if (!req.ip) {
      return res.status(400).json({ message: 'IP is required' })
    }

    await AuthService.createPin({ email: body.email, ip: req.ip })

    res.status(200).json({ message: 'OK' })
  }
  catch (error) {
    next(error)
  }
})

authRoute.post('/api/auth/email/check-pin', rateLimit(10, 1), passport.authenticate('local'), (req, res, next) => {
  try {
    console.log('callback here')
    res.redirect('/')
  }
  catch (error) {
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
    res.status(200).send({ authenticated: true, userId: user.id, tenantId: user.tenantId, initials, signupCompleted: user.tenant.signupCompleted, role: user.role as 'USER' | 'OWNER' } satisfies GetCurrentUserDto)
  }
  else {
    res.status(200).send({ authenticated: false } satisfies GetCurrentUserDto)
  }
})
