const passport = require('passport')

import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import express from 'express'
import { GetCurrentUserDto } from '../../frontend/src/types/types'
import { rateLimit } from '../../middlewares/rateLimit'
import { UserWithTenant } from '../passportConfig'
import prisma from '../prisma'
export const authRoute = express.Router()

authRoute.get(
  '/api/auth/google',
  passport.authenticate('google', {
    scope: ['email', 'profile'],
  })
)

authRoute.get(
  '/api/auth/google/callback',
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
  try {
    const body = req.body
    console.log(body)

    await prisma.log.create({
      data: {
        data: { email: body.email, ip: req.ip },
        event: 'pin-requested',
      },
    })

    // Check for existing pin codes
    const existingPinCodes = await prisma.emailLoginPinCode.findMany({
      where: {
        email: body.email,
        createdAt: {
          gte: new Date(Date.now() - 15 * 60 * 1000) // 15 minutes ago
        }
      },
    })

    // If there are too many existing pin codes or recent attempts, reject
    if (existingPinCodes.length >= 3) {
      console.error(`Too many pin code attempts for ${body.email}. Please try again later.`)
      return res.status(429).json({
        message: 'Too many pin code attempts. Please try again later.'
      })
    }

    // Generate new pin
    const pin = Math.floor(100000 + Math.random() * 900000)

    // Delete pins older than 15 minutes
    await prisma.emailLoginPinCode.deleteMany({
      where: {
        email: body.email,
        createdAt: {
          lt: new Date(Date.now() - 15 * 60 * 1000) // 15 minutes ago
        }
      },
    })

    // Create new pin
    await prisma.emailLoginPinCode.create({
      data: {
        email: body.email,
        pinCode: pin.toString(),
      },
    })

    await prisma.log.create({
      data: {
        data: { email: body.email, ip: req.ip },
        event: 'pin-created',
      },
    })

    // Send pin code via AWS SES
    const client = new SESClient({ region: "eu-north-1" });

    const command = new SendEmailCommand({
      Source: 'Siikli <no-reply@siikli.fi>',
      Destination: {
        ToAddresses: [body.email],
      },
      Message: {
        Subject: {
          Data: 'Kirjautumiskoodi Siikli-palveluun',
        },
        Body: {
          Html: {
            Data: `
              <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
                <p>Hei,</p>
                <p>Tässä on kirjautumiskoodisi Siikli-palveluun:</p>
    
                <p style="font-size: 20px; font-weight: bold; color: #1a202c;">
                  🔑 Koodi: ${pin}
                </p>
    
                <p>(Koodi on voimassa 15 minuuttia.)</p>
    
                <p>Jos et pyytänyt tätä koodia, voit huoletta jättää viestin huomiotta.</p>
    
                <p>Terveisin,<br />
                Siikli<br />
                <a href="mailto:juha.wilppu@siikli.fi">juha.wilppu@siikli.fi</a><br />
                <a href="https://v2.siikli.fi">https://v2.siikli.fi</a></p>
              </div>
            `,
          },
        },
      },
    })

    await client.send(command);

    await new Promise(resolve => setTimeout(resolve, 1500));

    const command2 = new SendEmailCommand({
      Source: 'Siikli Event <no-reply@siikli.fi>',
      Destination: {
        ToAddresses: ['juha.wilppu@gmail.com'],
      },
      Message: {
        Subject: {
          Data: 'New event: PIN code',
        },
        Body: {
          Html: {
            Data: `A pin code was just sent to ${body.email}`,
          },
        },
      },
    })
    await client.send(command2);

    console.log(`Pin ${pin} sent to ${body.email} via AWS SES`);
    console.log(`Event notified`);

    res.status(200).json({ message: 'OK' })
  } catch (error) {
    next(error)
  }
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
    res.status(401).end()
  }
})
