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
    console.log('ser')
    done(null, user.id)
  })

  passport.deserializeUser(async (id: number, done: any) => {
    console.log('deser')
    const user = await prisma.user.findFirst({ where: { id } })
    done(null, user)
  })

  const clientID = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET

  console.log('passportConfig')
  console.log(clientID)
  console.log(clientSecret)

  passport.use(
    new GoogleStrategy(
      {
        clientID: clientID,
        clientSecret: clientSecret,
        callbackURL: 'http://localhost:5173/auth/google/callback',
        proxy: true,
      },
      async (url: string, profile: Profile, something: any, done: any) => {
        console.log('GoogleStrategy')
        console.log(url)
        console.log(profile)
        console.log(something)
        console.log(done)
        const existingUser = await prisma.user.findFirst({
          where: { externalId: profile.id },
        })
        console.log('existingUser', existingUser)

        if (existingUser) {
          // We already have saved this customer to db
          done(null, existingUser)
        } else {
          // New user. Save it to db.
          const user = await prisma.user.create({
            data: {
              username: profile.displayName,
              externalId: profile.id,
              email: profile.emails[0].value,
            },
          })
          done(null, user)
        }
      }
    )
  )
}

export default init
