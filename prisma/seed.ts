import { addMonths } from "date-fns"
import prisma from "../src/prisma"

async function main() {
    console.log('Running seed 🌱')

    // Create tenant 1

    const tenant = await prisma.tenant.create({
        data: {
            name: 'Siikli Solutions Oy',
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
            name: 'Alepa Sello',
            tenantId: tenant.id,
            chain: 'Alepa',
            compensation: 0,
            address: 'Leppävaarankatu 3',
            postalCode: '02600',
            city: 'Espoo',
            phone: '010 7669010',
            email: 'test@example.com',
            showPriceWithoutTax: true,
            reference: '1234567890',
            companyName: 'Test company',
            orderIndex: 1,
            businessId: '1234567890',
            customerGroup: 'Test group',

        }
    })

    await prisma.customer.create({
        data: {
            name: 'Alepa Lintuvaara',
            tenantId: tenant.id,
            chain: 'Alepa',
            compensation: 0,
            address: 'Linnuntie 2',
            postalCode: '02660',
            city: 'Espoo',
            phone: '010 7669920',
            email: 'test@example.com',
            showPriceWithoutTax: true,
            reference: '1234567890',
            companyName: 'Test company',
            orderIndex: 1,
            businessId: '1234567890',
            customerGroup: 'Test group',

        }
    })

    await prisma.product.create({
        data: {
            name: 'Siikli',
            tenantId: tenant.id,
            price: 1.40,
            price0: 1.23,
        }
    })

    await prisma.product.create({
        data: {
            name: 'Rosamunda',
            tenantId: tenant.id,
            price: 1.60,
            price0: 1.43,
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
            name: 'New company',
            businessId: 'Y-11111111-1',
            streetAddress: 'Testikatu 1',
            postalCode: '11111',
            city: 'Espoo',
            phone: '0500000000',
            email: 'rajajarvi@gmail.com',
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
            email: 'rajajarvi@gmail.com',
            googleExternalId: '118037848383891596587',
            tenantId: tenant2.id,
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