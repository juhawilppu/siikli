import type { User } from '@prisma/client'
import path from 'node:path'
import * as Sentry from '@sentry/node'
import { RedisStore } from 'connect-redis'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import session from 'express-session'
import helmet from 'helmet'
import passport from 'passport'
import { authRoute } from './api/auth'
import { customersRoute } from './api/customers'
import { exceptionsRoute } from './api/exceptions'
import { healthRoute } from './api/health'
import { invoiceRoute } from './api/invoices'
import { ordersRoute } from './api/orders'
import { packagingListRoute } from './api/packaging-list'
import { productsRoute } from './api/products'
import { salesReportRoute } from './api/sales_report'
import { tenantsRoute } from './api/tenants'
import { errorHandler } from './middlewares/error-handler'
import passportConfig from './passportConfig'
import redisClient from './redis'

import { log } from './utils/app-log'
import './instrument.js'

// Always load root-level .env
dotenv.config({
  path: path.join(process.cwd(), '../.env'),
})

export async function createApp(): Promise<express.Application> {
  const app = express()
  app.use(helmet())
  app.disable('x-powered-by')

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

  log.info('Siikli backend starting...')

  app.use(cookieParser()) // For parsing cookies
  app.set('trust proxy', 1) // trust first proxy

  // Handle uncaught exceptions without crashing
  process.on('uncaughtException', (err) => {
    log.error('Uncaught Exception:', err)
    Sentry.captureException(err)
  })

  // Handle unhandled promise rejections without crashing
  process.on('unhandledRejection', (reason, _promise) => {
    log.error('Unhandled Rejection:', reason)
    Sentry.captureException(reason)
  })

  const sessionSecret = process.env.SESSION_SECRET
  if (!sessionSecret || sessionSecret.length < 32) {
    throw new Error('SESSION_SECRET is missing or too short. It must be at least 32 characters.')
  }

  await redisClient.connect()

  app.use(
    session({
      store: new RedisStore({ client: redisClient }),
      secret: sessionSecret,
      name: `${process.env.NODE_ENV === 'production' ? '__Host-' : ''}siikli-session`,
      proxy: process.env.NODE_ENV === 'production',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production', // true in prod with HTTPS
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      },
    }),
  )

  app.use(express.urlencoded({ extended: false })) // For parsing application/x-www-form-urlencoded

  passportConfig()
  app.use(passport.initialize())
  app.use(passport.session())

  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 0.1,
      environment: process.env.NODE_ENV,
    })
  }

  app.use(authRoute)
  app.use(ordersRoute)
  app.use(customersRoute)
  app.use(productsRoute)
  app.use(tenantsRoute)
  app.use(salesReportRoute)
  app.use(invoiceRoute)
  app.use(packagingListRoute)
  app.use(healthRoute)
  if (process.env.NODE_ENV === 'development') {
    app.use(exceptionsRoute)
  }

  app.use((req, res, next) => {
    if (req.user) {
      const user = req.user as User
      Sentry.setUser({
        userId: user.id,
        tenantId: user.tenantId,
      })
    }
    next()
  })

  // Error handlers must be after all routes
  app.use(errorHandler)

  return app
}
