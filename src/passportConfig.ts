import { PrismaClient, Tenant, User } from '@prisma/client';
import { Strategy as LocalStrategy } from 'passport-local';
const passport = require('passport')
const GoogleStrategy = require('passport-google-oidc')

const prisma = new PrismaClient()

export interface UserWithTenant extends User {
  tenant: Tenant
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
        callbackURL: 'http://localhost:5173/auth/google/callback',
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

        if (existingUser) {
          // We already have saved this customer to db
          console.log('done1')
          return cb(null, existingUser)
        } else {
          return cb(null, false, { message: 'New user registration is not allowed', redirectTo: '/unauthorized' })

          /*
          // New user. Save it to db.
          const tenant = await prisma.tenant.findFirstOrThrow()
          const user = await prisma.user.create({
            data: {
              tenantId: tenant.id,
              username: profile.displayName,
              externalId: profile.id,
              email: profile.emails[0].value,
            },
          })
          console.log('done2')
          return cb(null, user)
          */
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
          const emailLoginPinCode = await prisma.emailLoginPinCode.findUnique({ where: { email } });
          console.log('emailLoginPinCode.pinCode', emailLoginPinCode?.pinCode)
          console.log('pinCode', pinCode)
          if (!emailLoginPinCode) return done(null, false, { message: 'Email has no active pin code' });

          let user = await prisma.user.findUnique({ where: { email } });
          console.log('user', user)

          if (!user) {
            const tenant = await prisma.tenant.create({
              data: {
                name: '',
                signupCompleted: false
              },
            })
            user = await prisma.user.create({
              data: {
                email,
                tenantId: tenant.id,
              },
            })
          }

          // Compare pin directly (or use bcrypt.compare if hashed)
          if (emailLoginPinCode.pinCode !== pinCode) {
            return done(null, false, { message: 'Incorrect PIN' });
          }
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
