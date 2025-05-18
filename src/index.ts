import type { User } from '@prisma/client'
import type { NextFunction, Request, Response } from 'express'
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
import dashboardRoute from './api/dashboard'
import invoiceRoute from './api/invoices'
import { ordersRoute } from './api/orders'
import productsRoute from './api/products'

import salesReportRoute from './api/sales_report'
import tenantsRoute from './api/tenants'
import warehouseRoute from './api/warehouse-report'
import { authErrorHandler } from './middlewares/authError'
import passportConfig from './passportConfig'
import redisClient from './redis'
import './instrument.js'

dotenv.config()

async function startServer() {
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

  console.log('starting')
  console.log(process.env)

  app.use(cookieParser()) // For parsing cookies
  app.set('trust proxy', 1) // trust first proxy

  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err)
    Sentry.captureException(err)
    process.exit(1);
  })

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason)
    Sentry.captureException(reason)
    process.exit(1);
  })

  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('General error handler caught:', {
      message: err.message,
      name: err.name,
      stack: err.stack,
      path: req.path,
      method: req.method,
    })

    // Ensure we always send a response
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal server error',
        message: err.message,
      })
    }
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
      name: 'siikli-session',
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
  app.use(warehouseRoute)
  app.use(dashboardRoute)

  app.get('/api/health', (req, res) => {
    // console.log('health check')
    res.status(200).send({ message: 'OK' })
  })

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

  // custom 404
  app.use((req, res, next) => {
    res.status(404).send(`Sorry can't find that!`)
  })

  // Error handlers must be after all routes
  app.use(authErrorHandler) // Auth errors first
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('General error handler caught:', {
      message: err.message,
      name: err.name,
      stack: err.stack,
      path: req.path,
      method: req.method,
    })

    Sentry.captureException(err)

    // Ensure we always send a response
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal server error'
      })
    }
  })

  const server = app.listen(3000, () => {
    console.log(`🚀 Server ready at: http://localhost:3000`)
  })

  process.on("SIGTERM", () => {
    server.close(() => {
      console.log("Server closed gracefully")
      Sentry.captureMessage("Server closed gracefully")
    })
  })

  process.on("SIGINT", () => {
    server.close(() => {
      console.log("Server closed via SIGINT")
      Sentry.captureMessage("Server closed via SIGINT")
      process.exit(0)
    })
  })
}

startServer().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})

