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
    done(null, (user as UserWithTenant).id)
  })

  passport.deserializeUser(async (id: string, done: any) => {
    const user = await prisma.user.findFirst({ where: { id }, include: { tenant: true } })
    done(null, user as UserWithTenant)
  })

  const clientID = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET

  if (clientID && clientSecret) {
    passport.use(
      new GoogleStrategy(
        {
          clientID,
          clientSecret,
          callbackURL: `${process.env.PRIMARY_URL}/api/auth/google/callback`,
        },
        async (issuer: any, profile: any, cb: any) => {
          const existingUser = await prisma.user.findFirst({
            where: { email: profile.emails[0].value },
          })

          await prisma.log.create({
            data: {
              data: { email: profile.emails[0].value },
              event: 'google-login-success',
            },
          })

          if (existingUser) {
          // We already have saved this customer to db
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { lastLoginAt: new Date() },
            })
            return cb(null, existingUser)
          }
          else {
            const { user } = await TenantService.createUserAndTenant(profile.emails[0].value, profile.id)
            return cb(null, user)
          }
        },
      ),
    )
  }
  else {
    console.warn('GoogleStrategy not initialized. GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is not set')
  }

  passport.use(
    new LocalStrategy(
      { usernameField: 'email', passwordField: 'pinCode' },
      async (email, pinCode, done) => {
        if (email.endsWith('@example.com') && process.env.ENVIRONMENT === 'localhost' && process.env.VITEST === 'true') {
          const existingUser = await prisma.user.findFirst({
            where: { email },
          })
          if (existingUser) {
            await TenantService.deleteTenant(
              existingUser.tenantId,
              existingUser.id,
            )
          }
          const { user: newUser } = await TenantService.createUserAndTenant(email)
          return done(null, {
            id: newUser.id,
            tenantId: newUser.tenantId,
            email: newUser.email,
            role: newUser.role,
          })
        }

        try {
          const emailLoginPinCode = await prisma.emailLoginPinCode.findFirst({
            where: {
              email,
              pinCode,
              createdAt: { gte: subMinutes(new Date(), 15) },
            },
          })
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

          return done(null, user)
        }
        catch (err) {
          return done(err)
        }
      },
    ),
  )
}

export default init
