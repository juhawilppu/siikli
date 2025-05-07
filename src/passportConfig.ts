import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { PrismaClient, Tenant, User } from '@prisma/client';
import { addMonths } from 'date-fns';
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
  const client = new SESClient({ region: "eu-north-1" });

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

<p>Olen Juha, Siiklin kehittäjä. Seuraavien viikkojen aikana saatan lähettää sinulle muutamia vinkkejä ja päivityksiä (enintään yksi viesti viikossa, lupaan). Kerron tämän nyt, jotta voit halutessasi poistua listalta &ndash; ei pahalla.</p>

<p>Parhaiten pääset alkuun kirjautumalla sisään ja luomalla ensimmäisen tilauksen tai tuotteen. Jos tarvitset apua, voit laittaa viestiä suoraan minulle.</p>

<p>➡️ <a href="https://v2.siikli.fi" style="color: #1a73e8;">Kirjaudu Siikliin</a></p>

<p>Kiitos että kokeilet &ndash; tämä auttaa minua kehittämään palvelusta entistä paremman.</p>

<hr style="margin: 2em 0;" />

 <p style="margin-top: 2em; font-size: 14px; color: #666;">
Kyllä, tämä viesti on automatisoitu &ndash; mutta olen oikea ihminen ja luen jokaisen vastauksen.
</p>

<p style="margin-top: 1em;">
Terveisin,<br />
Juha Wilppu<br />
Siikli
</p>

  <p style="font-size: 14px; margin-top: 2em;">
    👉 <a href="https://v2.siikli.fi/api/unsubscribe?email=${encodeURIComponent(email)}" style="color: #888;">Poistu tältä listalta yhdellä klikkauksella</a>
  </p>

              </div>

          `,
        },
      },
    },
  })

  await client.send(command);
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
