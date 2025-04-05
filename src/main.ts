import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import session from 'express-session'
import helmet from 'helmet'
import passport from 'passport'
import { authRoute } from './api/auth'
import companiesRoute from './api/companies'
import { customersRoute } from './api/customers'
import { ordersRoute } from './api/orders'
import { postsRoute } from './api/posts'
import productsRoute from './api/products'
import salesReportRoute from './api/sales_report'
import warehouseRoute from './api/warehouse-report'
import passportConfig from './passportConfig'

import { RedisStore } from 'connect-redis'
import dotenv from 'dotenv'
import invoiceRoute from './api/invoices'
import redisClient from './redis'
dotenv.config();

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

  process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
    // You can decide whether to exit or not
    // process.exit(1);
  });

  process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection:", reason);
    // Same here, decide if you want to crash or just log
    // process.exit(1);
  });

  app.use((err, req, res, next) => {
    console.error("💥 Error handler caught:", err);
    res.status(500).json({ message: "Something went wrong." });
  });

  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret || sessionSecret.length < 32) {
    throw new Error('SESSION_SECRET is missing or too short. It must be at least 32 characters.');
  }

  await redisClient.connect();

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
    })
  );

  app.use(express.urlencoded({ extended: false })) // For parsing application/x-www-form-urlencoded

  passportConfig()
  app.use(passport.initialize())
  app.use(passport.session())
  app.use(authRoute)
  app.use(postsRoute)
  app.use(ordersRoute)
  app.use(customersRoute)
  app.use(productsRoute)
  app.use(companiesRoute)
  app.use(salesReportRoute)
  app.use(invoiceRoute)
  app.use(warehouseRoute)

  if (process.env.NODE_ENV === 'production') {
    // Express will serve the client main.js etc.
    app.use(express.static('client/build'))

    // Express will redirect to / if it's doesn't recognize the route
    const path = require('path')
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
    })
  }

  // custom 404
  app.use((req, res, next) => {
    res.status(404).send("Sorry can't find that!")
  })

  // custom error handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error(err.stack)
    res.status(500).send('Something went wrong')
  })

  const server = app.listen(3000, () => {
    console.log(`🚀 Server ready at: http://localhost:3000`)
    console.log(
      `⭐️ See sample requests: http://pris.ly/e/ts/rest-express#3-using-the-rest-api`
    )
  })
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});