import type { Tenant, User } from '@prisma/client'
import { subMinutes } from 'date-fns'

import passport from 'passport'
import GoogleStrategy from 'passport-google-oidc'

import { Strategy as LocalStrategy } from 'passport-local'
import prisma from './prisma'
import { TenantService } from './services/tenant-service'

export interface UserWithTenant extends User {
  tenant: Tenant
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

  const clientID = process.env.GOOGLE_CLIENT_ID!
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!

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
          where: { email: profile.emails[0].value },
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
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { lastLoginAt: new Date() },
          })
          return cb(null, existingUser)
        }
        else {
          const { user } = await TenantService.createUserAndTenant(profile.emails[0].value, profile.id)
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

          const emailLoginPinCode = await prisma.emailLoginPinCode.findFirst({
            where: {
              email,
              pinCode,
              createdAt: { gte: subMinutes(new Date(), 15) },
            },
          })
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

          await prisma.emailLoginPinCode.delete({
            where: { id: emailLoginPinCode.id },
          })

          let user = await prisma.user.findUnique({ where: { email } })
          console.log('user', user)

          if (!user) {
            const { user: newUser } = await TenantService.createUserAndTenant(email)
            user = newUser
          }

          await prisma.log.create({
            data: {
              data: { email },
              event: 'pin-check-success',
            },
          })
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
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
