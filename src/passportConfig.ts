import { PrismaClient, User } from '@prisma/client'

const passport = require('passport')
const GoogleStrategy = require('passport-google-oidc')
const prisma = new PrismaClient()

interface Profile {
  id: string
  displayName: string
  name: {
    familyName: string
    givenName: string
  }
  emails: { value: string }[]
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

    const user = await prisma.user.findFirst({ where: { id } })
    console.log('user from db')
    console.log(user)
    done(null, user)
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
          where: { externalId: profile.id },
        })
        console.log('existingUser', existingUser)

        if (existingUser) {
          // We already have saved this customer to db
          console.log('done1')
          return cb(null, existingUser)
        } else {
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
        }
      }
    )
  )
}

export default init
