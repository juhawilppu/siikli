import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    console.log('Running seed 🌱')

    const companyId = await prisma.company.create({
        data: {
            address1: 'Heikunantie 9 A 6',
            businessId: 'Y-1',
            companyName: 'Juha Wilppu Tmi',
            invoiceBankName: 'Nordea',
            invoiceBankNumber: '1',
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