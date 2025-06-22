import nodeCrypto from 'node:crypto'
import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses'
import prisma from '../prisma'

export const AuthService = {

  async createPin({ email, ip }: { email: string, ip: string }) {
    await prisma.log.create({
      data: {
        data: { email, ip },
        event: 'pin-requested',
      },
    })

    // Generate new pin
    const pin = Math.floor(100000 + nodeCrypto.randomInt(900000))

    // Delete pins older than 15 minutes
    await prisma.emailLoginPinCode.deleteMany({
      where: {
        createdAt: {
          lt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        },
      },
    })

    // Create new pin
    await prisma.emailLoginPinCode.create({
      data: {
        email,
        pinCode: pin.toString(),
      },
    })

    await prisma.log.create({
      data: {
        data: { email, ip },
        event: 'pin-created',
      },
    })

    // Send pin code via AWS SES
    const client = new SESClient({ region: 'eu-north-1' })

    const command = new SendEmailCommand({
      Source: 'Siikli <no-reply@siikli.fi>',
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Subject: {
          Data: 'Kirjautumiskoodi Siikli-palveluun',
        },
        Body: {
          Html: {
            Data: `
                    <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
                      <p>Hei,</p>
                      <p>Tässä on kirjautumiskoodisi Siikli-palveluun:</p>
          
                      <p style="font-size: 20px; font-weight: bold; color: #1a202c;">
                        🔑 Koodi: ${pin}
                      </p>
          
                      <p>Koodi on voimassa 15 minuuttia.</p>
          
                      <p>Jos et pyytänyt tätä koodia, voit huoletta jättää viestin huomiotta.</p>
          
                      <p>Terveisin,<br />
                      Siikli<br />
                      <a href="mailto:juha.wilppu@siikli.fi">juha.wilppu@siikli.fi</a><br />
                      <a href="https://siikli.fi">https://siikli.fi</a></p>
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
          Data: 'New event: PIN code',
        },
        Body: {
          Html: {
            Data: `A pin code was just sent to ${email}`,
          },
        },
      },
    })
    await client.send(command2)

    console.log(`Pin ${pin} sent to ${email} via AWS SES`)
    console.log(`Event notified`)
  },
}
