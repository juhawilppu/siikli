import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    console.log('Running seed 🌱')

    const tenantId = await prisma.tenant.create({
        data: {
            name: 'Juha Wilppu Tmi',
            businessId: 'Y-1',
            streetAddress: 'Heikunantie 9 A 6',
            invoiceBankName: 'Nordea',
            invoiceBankAccount: '1',
            invoiceReference: 'k',
            invoiceSumRow: 'k'
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