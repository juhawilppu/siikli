import type { Tenant, User } from '@prisma/client'
import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses'
import { addMonths } from 'date-fns'

import passport from 'passport'
import GoogleStrategy from 'passport-google-oidc'

import { Strategy as LocalStrategy } from 'passport-local'
import prisma from './prisma'

export interface UserWithTenant extends User {
  tenant: Tenant
}

async function createUserAndTenant(email: string, googleExternalId?: string) {
  const tenant = await prisma.tenant.create({
    data: {
      name: '',
      signupCompleted: false,
      subscriptionType: 'PREMIUM',
      subscriptionEndDate: null,
      trialEndDate: addMonths(new Date(), 3).toISOString(),
    },
  })
  await prisma.log.create({
    data: {
      data: { email, tenantId: tenant.id },
      event: 'tenant-created',
    },
  })
  const user = await prisma.user.create({
    data: {
      email,
      tenantId: tenant.id,
      googleExternalId,
    },
  })
  await prisma.log.create({
    data: {
      data: { email, tenantId: tenant.id, googleExternalId },
      event: 'user-created',
    },
  })
  const client = new SESClient({ region: 'eu-north-1' })

  const command = new SendEmailCommand({
    Source: 'Juha Wilppu <juha.wilppu@siikli.fi>',
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Subject: {
        Data: 'Tervetuloa Siikliin',
      },
      Body: {
        Html: {
          Data: `
<div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
  <p>Hei, ja tervetuloa Siikliin!</p>

  <p>Olen Juha, Siiklin kehittäjä.</p>

  <p>Parhaiten pääset alkuun kirjautumalla sisään ja luomalla ensimmäisen tilauksen tai tuotteen. Jos tarvitset apua, voit laittaa viestiä suoraan minulle.</p>

  <p>➡️ <a href="https://v2.siikli.fi" style="color: #1a73e8;">Kirjaudu Siikliin</a></p>

  <p>Kiitos että käytät Siikliä &ndash; se auttaa minua kehittämään palvelusta entistä paremman.</p>

  <hr style="margin: 2em 0;" />

  <p style="margin-top: 2em; font-size: 14px; color: #666;">
  Kyllä, tämä viesti on automatisoitu &ndash; mutta olen oikea ihminen ja luen jokaisen vastauksen.
  </p>

  <p style="margin-top: 1em;">
  Terveisin,<br />
  Juha Wilppu<br />
  Siikli
  </p>
</div>
          `,
        },
      },
    },
  })

  await client.send(command)

  await new Promise(resolve => setTimeout(resolve, 1500))

  const command2 = new SendEmailCommand({
    Source: 'Siikli Event <no-reply@siikli.fi>',
    Destination: {
      ToAddresses: ['juha.wilppu@gmail.com'],
    },
    Message: {
      Subject: {
        Data: 'New event: Welcome message',
      },
      Body: {
        Html: {
          Data: `A new welcome message was just sent to ${email}`,
        },
      },
    },
  })
  await client.send(command2)

  return user
}

function init() {

  passport.serializeUser<string>((user: Express.User, done) => {
    console.log('serialize')
    console.log(user)
    console.log(done)
    done(null, (user as UserWithTenant).id)
  })

  passport.deserializeUser(async (id: string, done: any) => {
    console.log('deserialize', id)

    const user = await prisma.user.findFirst({ where: { id }, include: { tenant: true } })
    console.log('user from db')
    console.log(user)
    done(null, user as UserWithTenant)
  })

  const clientID = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET

  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL: `${process.env.PRIMARY_URL}/api/auth/google/callback`,
      },
      async (issuer: any, profile: any, cb: any) => {
        console.log('GoogleStrategy')
        console.log(issuer)
        console.log(profile)
        console.log(cb)
        const existingUser = await prisma.user.findFirst({
          where: { googleExternalId: profile.id },
        })
        console.log('existingUser', existingUser)

        await prisma.log.create({
          data: {
            data: { email: profile.emails[0].value },
            event: 'google-login-success',
          },
        })
        
        if (existingUser) {
          // We already have saved this customer to db
          console.log('done1')
          return cb(null, existingUser)
        }
        else {
          const user = await createUserAndTenant(profile.emails[0].value, profile.id)
          console.log('done2')
          return cb(null, user)
        }
      },
    ),
  )

  passport.use(
    new LocalStrategy(
      { usernameField: 'email', passwordField: 'pinCode' },
      async (email, pinCode, done) => {
        try {
          console.log('LocalStrategy here')

          const emailLoginPinCode = await prisma.emailLoginPinCode.findFirst({ where: { email, pinCode } })
          console.log('emailLoginPinCode', emailLoginPinCode)
          console.log('pinCode', pinCode)
          if (!emailLoginPinCode) {
            await prisma.log.create({
              data: {
                data: { email },
                event: 'pin-check-failed',
              },
            })
            return done(null, false, { message: 'Email has no active pin code or wrong pin code' })
          }

          let user = await prisma.user.findUnique({ where: { email } })
          console.log('user', user)

          if (!user) {
            user = await createUserAndTenant(email)
          }

          await prisma.log.create({
            data: {
              data: { email },
              event: 'pin-check-success',
            },
          })

          console.log('LocalStrategy success')
          return done(null, user)
        }
        catch (err) {
          console.log('LocalStrategy error', err)
          return done(err)
        }
      },
    ),
  )
}

export default init
