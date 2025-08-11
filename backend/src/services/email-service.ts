import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses'

export async function sendEventEmail(event: string, content: string) {
  await sendEmail('juha.wilppu@siikli.fi', 'Siikli <no-reply@siikli.fi>', `Event: ${event}`, content)
}

export async function sendEmail(to: string, from: string, subject: string, body: string) {
  const client = new SESClient({ region: 'eu-north-1' })

  const command = new SendEmailCommand({
    Source: from,
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Subject: {
        Data: subject,
      },
      Body: {
        Html: {
          Data: `
              <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
                ${body}
              </div>
            `,
        },
      },
    },
  })

  await client.send(command)
}
