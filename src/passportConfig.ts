import { PrismaClient, User } from '@prisma/client'

const passport = require('passport')
const GoogleStrategy = require('passport-google-oidc')
const prisma = new PrismaClient()

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
      },
      async (
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: any
      ) => {
        console.log('GoogleStrategy')
        console.log(profile)
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
              username: profile._json.email,
              externalId: profile.id,
              email: profile._json.email,
            },
          })
          done(null, user)
        }
      }
    )
  )
}

export default init
