import type { GetCurrentUserResponse } from '@siikli/shared'
import type { UserSessionFromPassport } from '../passportConfig'
import express from 'express'
import passport from 'passport'
import { rateLimitByIp } from '../middlewares/rate-limit'
import { AuthService } from '../services/auth-service'

export const authRoute = express.Router()

authRoute.get(
  '/api/auth/google',
  rateLimitByIp(10, 30),
  passport.authenticate('google', {
    scope: ['email', 'profile'],
  }),
)

authRoute.get(
  '/api/auth/google/callback',
  rateLimitByIp(10, 30),
  passport.authenticate('google', { failureRedirect: '/error' }),
  (req, res, next) => {
    try {
      res.redirect(process.env.PRIMARY_URL ?? 'https://app.siikli.fi')
    }
    catch (error) {
      console.log('login error', error)
      next(error)
    }
  },
)

authRoute.post('/api/auth/email/create-pin', rateLimitByIp(10, 30), async (req, res, next) => {
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

authRoute.post('/api/auth/email/check-pin', rateLimitByIp(10, 30), passport.authenticate('local'), (req, res, next) => {
  try {
    res.redirect(process.env.PRIMARY_URL ?? 'https://app.siikli.fi')
  }
  catch (error) {
    console.log('login error', error)
    next(error)
  }
})

authRoute.post('/api/auth/logout', rateLimitByIp(20, 1), (req, res) => {
  req.logout((err) => {
    console.log('err', err)
    res.status(204).end()
  })
})

authRoute.get('/api/auth/current-user', rateLimitByIp(30, 1), (req, res) => {
  if (req.user) {
    const user = req.user as UserSessionFromPassport
    const initials = AuthService.parseInitials(user.email)
    res.status(200).send({ authenticated: true, userId: user.userId, email: user.email, tenantId: user.tenantId, initials, signupCompleted: user.tenantSignupCompleted, role: user.role as 'USER' | 'OWNER' } satisfies GetCurrentUserResponse)
  }
  else {
    res.status(200).send({ authenticated: false } satisfies GetCurrentUserResponse)
  }
})
