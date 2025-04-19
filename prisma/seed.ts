import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    console.log('Running seed 🌱')

    const tenant = await prisma.tenant.create({
        data: {
            name: 'Siikli Oy',
            businessId: 'Y-1234567-8',
            streetAddress: 'Test street 1',
            postalCode: '12345',
            city: 'Helsinki',
            phone: '1234567890',
            email: 'siikli@example.com',
            website: 'https://siikli.fi',
            invoiceBankName: 'Test bank',
            invoiceBankAccount: '1234567890',
            invoiceSwiftBic: '1234567890',
            invoiceReference: '1234567890',
            invoiceSumRow: 'Test sum row',
        }
    })

    const user = await prisma.user.create({
        data: {
            username: 'juhawilppu',
            email: 'juha.wilppu@gmail.com',
            externalId: '103471389951515378481',
            tenantId: tenant.id,
        }
    })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })