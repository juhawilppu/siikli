import nodeCrypto from 'node:crypto'
import prisma from '../prisma'
import { sendEmail, sendEventEmail } from './email-service'

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

    await sendEmail(email, 'Kirjautumiskoodi Siikli-palveluun', `
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
      `)

    await sendEventEmail('New event: PIN code', `Pin ${pin} sent to ${email} via AWS SES`)

    console.log(`Pin ${pin} sent to ${email} via AWS SES`)
    console.log(`Event notified`)
  },
}
