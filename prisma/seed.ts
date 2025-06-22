import { Role } from '@prisma/client'
import { addMonths, subDays } from 'date-fns'
import { Decimal } from 'decimal.js'
import prisma from '../src/prisma'
import { TenantService } from '../src/services/tenant-service'
import { CustomerService } from '../src/services/customer-service'

async function main() {
  console.log('Running seed 🌱')

  // Create tenant 1
  const tenant = await TenantService.createTenant({
    tenantId: 'tenant-1',
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
    subscriptionStartDate: null
  })

  const sello = await CustomerService.createCustomer({
      name: 'Alepa Sello',
      tenantId: tenant.id,
      discount: 0,
      streetAddress: 'Leppävaarankatu 3',
      postalCode: '02600',
      city: 'Espoo',
      phone: '010 7669010',
      email: 'test@example.com',
      showPriceWithoutTax: true,
      invoiceReference: '1234567890',
      companyLegalName: 'Test company',
      businessId: '1234567890',
      customerGroup: 'Test group',
  })

  const lintuvaara = await CustomerService.createCustomer({
      name: 'Alepa Lintuvaara',
      tenantId: tenant.id,
      discount: 0,
      streetAddress: 'Linnuntie 2',
      postalCode: '02660',
      city: 'Espoo',
      phone: '010 7669920',
      email: 'test@example.com',
      showPriceWithoutTax: true,
      invoiceReference: '1234567890',
      companyLegalName: 'Test company',
      businessId: '1234567890',
      customerGroup: 'Test group',
  })

  const customers = [sello, lintuvaara]

  const packageSizes = [5, 10, 20, 30, 50, 100, 200, 300]
  for (const size of packageSizes) {
    await TenantService.createPackageSize({size, tenantId: tenant.id})
  }
  const packageTypes = ['Ltk', 'A', 'Pnt']
  for (const type of packageTypes) {
    await TenantService.createPackageType({name: type, tenantId: tenant.id})
  }

  await prisma.product.create({
    data: {
      name: 'Siikli',
      tenantId: tenant.id,
      price: 1.40,
      price0: 1.40 * (1 / 1.14),
      packageSize: 10,
      packageType: 'Ltk',
    },
  })

  await prisma.product.create({
    data: {
      name: 'Rosamunda',
      tenantId: tenant.id,
      price: 1.60,
      price0: 1.43,
      packageSize: 20,
      packageType: 'Ltk',
    },
  })

  for (let i = 0; i < 8; i++) {
    const price = new Decimal(1 + 2 * Math.random()).toDecimalPlaces(2)
    const price0 = price.div(1.14).toDecimalPlaces(2)
    await prisma.product.create({
      data: {
        name: `Product ${i}`,
        tenantId: tenant.id,
        price,
        price0,
        packageSize: packageSizes[Math.floor(Math.random() * packageSizes.length)],
        packageType: packageTypes[Math.floor(Math.random() * packageTypes.length)],
      },
    })
  }

  const products = await prisma.product.findMany({
    where: {
      tenantId: tenant.id,
    },
  })

  let orderCount = 0
  for (let customerIndex = 0; customerIndex < customers.length; customerIndex++) {
    const customer = customers[customerIndex]
    for (let orderIndex = 0; orderIndex < 6; orderIndex++) {
      const hasNote = Math.random() > 0.95
      const order = await prisma.order.create({
        data: {
          customerId: customer.id,
          tenantId: tenant.id,
          deliveryDate: subDays(new Date(), Math.floor(37 - orderIndex * 7 * Math.random())),
          waybillNumber: 1000 + orderCount,
          hasNote,
          noteHeader: hasNote ? 'Toimitus' : null,
          noteBody: hasNote ? 'Toimitus ovelle H3. Nouto aamulla.' : null,
        },
      })
      for (let productIdIndex = 0; productIdIndex < products.length; productIdIndex++) {
        const product = products[productIdIndex]
        await prisma.orderRow.create({
          data: {
            orderId: order.id,
            productId: product.id,
            amount: Math.floor(Math.random() * 10) * (product.packageSize || 1) + (Math.random() > 0.99 ? 0.5 : 0),
            price: product.price || new Decimal(0.99).toDecimalPlaces(2),
            price0: product.price0 || new Decimal(0.99).div(1.14).toDecimalPlaces(2),
            packageSize: product.packageSize || 1,
            packageType: product.packageType || 'Ltk',
            tenantId: tenant.id,
            freetext: Math.random() > 0.9 ? 'Erikoistuote' : null,
          },
        })
      }
      orderCount++
    }
  }
  await prisma.user.create({
    data: {
      email: 'juha.wilppu@gmail.com',
      googleExternalId: '103471389951515378481',
      tenantId: tenant.id,
      role: Role.OWNER,
    },
  })
  await prisma.user.create({
    data: {
      email: 'juha.wilppu+2@gmail.com',
      tenantId: tenant.id,
      role: Role.USER,
    },
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
    },
  })

  await prisma.user.create({
    data: {
      email: 'rajajarvi@gmail.com',
      googleExternalId: '118037848383891596587',
      tenantId: tenant2.id,
      role: Role.OWNER,
    },
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
  })
