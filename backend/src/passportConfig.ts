import { subMinutes } from 'date-fns'

import passport from 'passport'
import GoogleStrategy from 'passport-google-oidc'

import { Strategy as LocalStrategy } from 'passport-local'
import prisma from './prisma'
import { sendEventEmail } from './services/email-service'
import { TenantService } from './services/tenant-service'

export interface UserSessionFromPassport {
  userId: string
  tenantId: string
  email: string
  role: string
  tenantSignupCompleted: boolean
}

function init() {
  // This function determines what user data should be stored in the session.
  // The value you pass to 'done' here will be saved in the session cookie (typically just a user id).
  passport.serializeUser<string>((user: Express.User, done) => {
    // Here, we store only the userId in the session.
    done(null, (user as UserSessionFromPassport).userId)
  })

  // This function is called on every request with an active session.
  // It receives the value stored by serializeUser (userId), and you should fetch the full user object here.
  passport.deserializeUser(async (id: string, done: any) => {
    // Fetch the user from the database using the id from the session
    const user = await prisma.user.findUnique({ where: { id }, include: { tenant: true } })
    if (!user) {
      // If user not found, pass null to indicate no user
      return done(null, null)
    }
    // Attach the full user session object to req.user
    done(null, {
      userId: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role,
      tenantSignupCompleted: user.tenant.signupCompleted,
    } satisfies UserSessionFromPassport)
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
            include: { tenant: true },
          })

          await prisma.log.create({
            data: {
              data: { email: profile.emails[0].value },
              event: 'google-login-success',
            },
          })

          sendEventEmail('Google login success', `Google login success for ${profile.emails[0].value}`)

          if (existingUser) {
            // We already have saved this customer to db
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { lastLoginAt: new Date() },
            })
            // Return the full session object, not just userId
            return cb(null, {
              userId: existingUser.id,
              tenantId: existingUser.tenantId,
              email: existingUser.email,
              role: existingUser.role,
              tenantSignupCompleted: existingUser.tenant?.signupCompleted ?? false,
            } as UserSessionFromPassport)
          }
          else {
            const { user } = await TenantService.createUserAndTenant(profile.emails[0].value, profile.id)
            // Fetch the tenant to get signupCompleted
            const createdUser = await prisma.user.findUnique({ where: { id: user.id }, include: { tenant: true } })
            return cb(null, {
              userId: createdUser!.id,
              tenantId: createdUser!.tenantId,
              email: createdUser!.email,
              role: createdUser!.role,
              tenantSignupCompleted: createdUser!.tenant?.signupCompleted ?? false,
            } as UserSessionFromPassport)
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
        // Allow tests to bypass pin code check
        if (
          email.endsWith('@example.com')
          && pinCode === '123456'
          && process.env.ENVIRONMENT === 'localhost'
          && process.env.VITEST === 'true'
        ) {
          const existingUser = await prisma.user.findFirst({
            where: { email },
            include: { tenant: true },
          })
          if (existingUser) {
            await TenantService.deleteTenant(
              existingUser.tenantId,
              existingUser.id,
            )
          }
          const { user: newUser } = await TenantService.createUserAndTenant(email)
          const createdUser = await prisma.user.findUnique({ where: { id: newUser.id }, include: { tenant: true } })
          return done(null, {
            userId: createdUser!.id,
            tenantId: createdUser!.tenantId,
            email: createdUser!.email,
            role: createdUser!.role,
            tenantSignupCompleted: createdUser!.tenant?.signupCompleted ?? false,
          } as UserSessionFromPassport)
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

          let user = await prisma.user.findUnique({ where: { email }, include: { tenant: true } })

          if (!user) {
            const { user: newUser } = await TenantService.createUserAndTenant(email)
            user = await prisma.user.findUnique({ where: { id: newUser.id }, include: { tenant: true } })
          }

          await prisma.log.create({
            data: {
              data: { email },
              event: 'pin-check-success',
            },
          })

          sendEventEmail('Pin check success', `Pin login success for ${email}`)

          await prisma.user.update({
            where: { id: user!.id },
            data: { lastLoginAt: new Date() },
          })

          return done(null, {
            userId: user!.id,
            tenantId: user!.tenantId,
            email: user!.email,
            role: user!.role,
            tenantSignupCompleted: user!.tenant?.signupCompleted ?? false,
          } as UserSessionFromPassport)
        }
        catch (err) {
          return done(err)
        }
      },
    ),
  )
}

export default init
