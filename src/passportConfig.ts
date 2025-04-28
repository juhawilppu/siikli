import { PrismaClient, Tenant, User } from '@prisma/client';
import { Strategy as LocalStrategy } from 'passport-local';
const passport = require('passport')
const GoogleStrategy = require('passport-google-oidc')

const prisma = new PrismaClient()

export interface UserWithTenant extends User {
  tenant: Tenant
}

const createUserAndTenant = async (email: string, googleExternalId?: string) => {
  const tenant = await prisma.tenant.create({
    data: {
      name: '',
      signupCompleted: false
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
  return user
}

const init = () => {
  passport.serializeUser((user: User, done: any) => {
    console.log('serialize')
    console.log(user)
    console.log(done)
    done(null, user.id)
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
        clientID: clientID,
        clientSecret: clientSecret,
        callbackURL: process.env.PRIMARY_URL + '/api/auth/google/callback',
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
        } else {
          const user = await createUserAndTenant(profile.emails[0].value, profile.id)
          console.log('done2')
          return cb(null, user)
        }
      }
    )
  )

  passport.use(
    new LocalStrategy(
      { usernameField: 'email', passwordField: 'pinCode' },
      async (email, pinCode, done) => {
        try {
          console.log('LocalStrategy here')

          const emailLoginPinCode = await prisma.emailLoginPinCode.findFirst({ where: { email, pinCode } });
          console.log('emailLoginPinCode', emailLoginPinCode)
          console.log('pinCode', pinCode)
          if (!emailLoginPinCode) {
            await prisma.log.create({
              data: {
                data: { email },
                event: 'pin-check-failed',
              },
            })
            return done(null, false, { message: 'Email has no active pin code or wrong pin code' });
          }

          let user = await prisma.user.findUnique({ where: { email } });
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
          return done(null, user);
        } catch (err) {
          console.log('LocalStrategy error', err)
          return done(err);
        }
      }
    )
  );

}

export default init
