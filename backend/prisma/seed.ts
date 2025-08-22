import type { OrderRowDto } from '../src/services/order-service'
import { exit } from 'node:process'
import { Role } from '@prisma/client'
import { dateToIso, OrderStatus } from '@siikli/shared'
import { subDays } from 'date-fns'
import { Decimal } from 'decimal.js'
import prisma from '../src/prisma'
import { CustomerService } from '../src/services/customer-service'
import { OrderService } from '../src/services/order-service'
import { ProductService } from '../src/services/product-service'
import { TenantService } from '../src/services/tenant-service'
import { UserService } from '../src/services/user-service'
import { getRandomAmount, getRandomCustomer, getRandomFreetext, getRandomFromList, getRandomNote } from './seed-utils'

async function main() {
  console.log('Running seed 🌱')

  // Create tenant 1
  const tenant = await TenantService.createTenant({
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
    invoiceReference: '1234567890',
    invoiceSumRow: 'Test sum row',
    signupCompleted: true,
    subscriptionType: 'PREMIUM',
    subscriptionEndDate: null,
    subscriptionStartDate: null,
  })

  const juha = await UserService.createUser({
    email: 'juha.wilppu@gmail.com',
    tenantId: tenant.id,
    role: Role.OWNER,
  })

  await UserService.createUser({
    email: 'juha.wilppu+2@gmail.com',
    tenantId: tenant.id,
    role: Role.USER,
  })

  const jKauppa = await CustomerService.createCustomer({
    name: 'J-Kauppa',
    discount: new Decimal(0),
    streetAddress: 'Kaupankatu 1',
    postalCode: '02100',
    city: 'Espoo',
    phone: '010 7669010',
    email: 'j-kauppa@j-kauppa.fi',
    invoiceReference: '1234567890',
    companyLegalName: 'J-Kauppa Oy',
    businessId: '1234567890',
  }, tenant.id, juha.id)

  const wRuoka = await CustomerService.createCustomer({
    name: 'W-Ruoka',
    discount: new Decimal(0),
    streetAddress: 'Keskuskatu 1',
    postalCode: '02100',
    city: 'Espoo',
    phone: '010 7669920',
    email: 'w-ruoka@w-ruoka.fi',
    invoiceReference: '1234567890',
    companyLegalName: 'W-Ruoka Oy',
    businessId: '1234567890',
  }, tenant.id, juha.id)

  const customers = [jKauppa, wRuoka]

  const additionalCustomerCount = 3
  for (let i = 0; i < additionalCustomerCount; i++) {
    const customer = getRandomCustomer()
    const createdCustomer = await CustomerService.createCustomer(customer, tenant.id, juha.id)
    customers.push(createdCustomer)
  }

  const packageSizes = [5, 10, 20, 30, 50, 100, 200, 300]
  for (const size of packageSizes) {
    await TenantService.createPackageSize(tenant.id, size)
  }

  const packageTypes = ['Ltk', 'A', 'Pnt']
  for (const type of packageTypes) {
    await TenantService.createPackageType(tenant.id, type)
  }

  await ProductService.createProduct({
    name: 'Siikli, pesty',
    tenantId: tenant.id,
    price: new Decimal(1.40),
    packageSize: 10,
    packageType: 'Ltk',
    userId: juha.id,
  })

  await ProductService.createProduct({
    name: 'Siikli, uusi sato',
    tenantId: tenant.id,
    price: new Decimal(1.60),
    packageSize: 20,
    packageType: 'Ltk',
    userId: juha.id,
  })

  const productNames = ['Pesty kesäperuna', 'Kesäperuna Annabelle', 'Kesäperuna Colombo', 'Rosamunda']

  for (const productName of productNames) {
    const price = new Decimal(1 + 2 * Math.random()).toDecimalPlaces(2)
    await ProductService.createProduct({
      name: productName,
      tenantId: tenant.id,
      price,
      packageSize: getRandomFromList(packageSizes),
      packageType: getRandomFromList(packageTypes),
      userId: juha.id,
    })
  }

  const products = await ProductService.getProducts(tenant.id)

  const orderCount = 25

  for (const customer of customers) {
    for (let orderIndex = 0; orderIndex < orderCount; orderIndex++) {
      const orderRows: OrderRowDto[] = []
      for (let productIdIndex = 0; productIdIndex < products.length; productIdIndex++) {
        const product = products[productIdIndex]
        if (product.price === null || product.packageSize === null || product.packageType === null) {
          throw new Error('Product has null values')
        }
        orderRows.push({
          productId: product.id,
          amount: getRandomAmount(product.packageSize),
          price: product.price,
          packageSize: product.packageSize,
          packageType: product.packageType,
          freetext: getRandomFreetext(),
        })
      }

      const note = getRandomNote()

      await OrderService.createOrder({
        customerId: customer.id,
        tenantId: tenant.id,
        status: OrderStatus.WAITING_FOR_DELIVERY,
        deliveryDate: dateToIso(subDays(new Date(), (orderCount + orderIndex) * 7)), // one order every 7 days
        hasNote: note !== null,
        noteHeader: note?.header || null,
        noteBody: note?.body || null,
        items: orderRows.map(row => ({
          id: row.productId,
          price: row.price,
          packageSize: row.packageSize,
          packageType: row.packageType,
          freetext: row.freetext || '',
          productId: row.productId,
          amount: row.amount,
          packages: row.amount.div(row.packageSize).toNumber(),
        })),
      })
    }
  }

  // Create tenant 2

  const tenant2 = await TenantService.createTenant({
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
    invoiceReference: '1111111111',
    invoiceSumRow: 'Test sum row',
    signupCompleted: true,
    subscriptionType: 'PREMIUM',
    subscriptionEndDate: null,
    subscriptionStartDate: null,
  })

  await UserService.createUser({
    email: 'rajajarvi@gmail.com',
    tenantId: tenant2.id,
    role: Role.OWNER,
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    exit(1)
  })
