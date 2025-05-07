import { PrismaClient } from "@prisma/client"
import { addMonths } from "date-fns"

const prisma = new PrismaClient()

async function main() {
    console.log('Running seed 🌱')

    // Create tenant 1

    const tenant = await prisma.tenant.create({
        data: {
            name: 'Siikli Corporation',
            businessId: 'Y-1234567-8',
            streetAddress: 'Test street 1',
            postalCode: '12345',
            city: 'Helsinki',
            phone: '1234567890',
            email: 'siikli@siikli.fi',
            website: 'https://siikli.fi',
            invoiceBankName: 'Test bank',
            invoiceBankAccount: '1234567890',
            invoiceSwiftBic: '1234567890',
            invoiceReference: '1234567890',
            invoiceSumRow: 'Test sum row',
            signupCompleted: true,
            subscriptionType: 'PREMIUM',
            subscriptionEndDate: null,
            subscriptionStartDate: null,
            trialEndDate: addMonths(new Date(), 3).toISOString(),
        }
    })

    await prisma.customer.create({
        data: {
            name: 'Test customer',
            tenantId: tenant.id,
            chain: '001',
            compensation: 100,
            address: 'Test address',
            postalCode: '12345',
            city: 'Helsinki',
            phone: '1234567890',
            email: 'test@example.com',
            showPriceWithoutTax: true,
            reference: '1234567890',
            companyName: 'Test company',
            orderIndex: 1,
            businessId: '1234567890',
            customerGroup: 'Test group',

        }
    })

    await prisma.user.create({
        data: {
            email: 'juha.wilppu@gmail.com',
            googleExternalId: '103471389951515378481',
            tenantId: tenant.id,
        }
    })

    // Create tenant 2

    const tenant2 = await prisma.tenant.create({
        data: {
            name: 'Wilppu Yritys',
            businessId: 'Y-11111111-1',
            streetAddress: 'Testikatu 1',
            postalCode: '11111',
            city: 'Espoo',
            phone: '0500000000',
            email: 'juha.wilppu@gmail.com',
            website: 'https://juhawilppu.fi',
            invoiceBankName: 'Danske Bank',
            invoiceBankAccount: '1111111111',
            invoiceSwiftBic: '1111111111',
            invoiceReference: '1111111111',
            invoiceSumRow: 'Test sum row',
            signupCompleted: true,
            subscriptionType: 'PREMIUM',
            subscriptionEndDate: null,
            subscriptionStartDate: null,
            trialEndDate: addMonths(new Date(), 3).toISOString(),
        }
    })

    await prisma.user.create({
        data: {
            email: 'juha.wilppu+yritys@gmail.com',
            googleExternalId: null,
            tenantId: tenant2.id,
        }
    })

    await prisma.customer.create({
        data: {
            name: 'Testiasiakas',
            tenantId: tenant2.id,
            chain: '001',
            compensation: 100,
            address: 'Testikatu 1',
            postalCode: '12345',
            city: 'Oulu',
            phone: '1234567890',
            email: 'test@example.com',
            showPriceWithoutTax: true,
            reference: '1234567890',
            companyName: 'Test company',
            orderIndex: 1,
            businessId: '1234567890',
            customerGroup: 'Test group',
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