import type { OrderRowDto } from '../src/services/order-service'
import { exit } from 'node:process'
import { Role } from '@prisma/client'
import { subDays } from 'date-fns'
import { Decimal } from 'decimal.js'
import prisma from '../src/prisma'
import { CustomerService } from '../src/services/customer-service'
import { OrderService } from '../src/services/order-service'
import { ProductService } from '../src/services/product-service'
import { TenantService } from '../src/services/tenant-service'
import { UserService } from '../src/services/user-service'

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
    invoiceSwiftBic: '1234567890',
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

  const sello = await CustomerService.createCustomer({
    name: 'Alepa Sello',
    discount: new Decimal(0),
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
  }, tenant.id, juha.id)

  const lintuvaara = await CustomerService.createCustomer({
    name: 'Alepa Lintuvaara',
    discount: new Decimal(0),
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
  }, tenant.id, juha.id)

  const customers = [sello, lintuvaara]

  const packageSizes = [5, 10, 20, 30, 50, 100, 200, 300]
  for (const size of packageSizes) {
    await TenantService.createPackageSize({ size, tenantId: tenant.id })
  }

  const packageTypes = ['Ltk', 'A', 'Pnt']
  for (const type of packageTypes) {
    await TenantService.createPackageType({ name: type, tenantId: tenant.id })
  }

  await ProductService.createProduct({
    name: 'Siikli',
    tenantId: tenant.id,
    price: new Decimal(1.40),
    price0: new Decimal(1.40).div(1.14),
    packageSize: 10,
    packageType: 'Ltk',
  })

  await ProductService.createProduct({
    name: 'Rosamunda',
    tenantId: tenant.id,
    price: new Decimal(1.60),
    price0: new Decimal(1.60).div(1.14),
    packageSize: 20,
    packageType: 'Ltk',
  })

  // Verify that product creation fails when price and price0 don't match
  {
    const price = new Decimal(1.60)
    const invalidPrice0 = price.div(1.14).mul(1.1) // Intentionally wrong price0

    if (await ProductService.createProduct({
      name: 'Rosamunda wrong price',
      tenantId: tenant.id,
      price,
      price0: invalidPrice0,
      packageSize: 20,
      packageType: 'Ltk',
    }).catch(() => null) !== null) {
      throw new Error('ProductService.createProduct should reject mismatched prices')
    }
  }

  for (let i = 0; i < 8; i++) {
    const price = new Decimal(1 + 2 * Math.random()).toDecimalPlaces(2)
    const price0 = price.div(1.14).toDecimalPlaces(2)
    await ProductService.createProduct({
      name: `Product ${i}`,
      tenantId: tenant.id,
      price,
      price0,
      packageSize: packageSizes[Math.floor(Math.random() * packageSizes.length)],
      packageType: packageTypes[Math.floor(Math.random() * packageTypes.length)],
    })
  }

  const products = await ProductService.getProducts(tenant.id)

  for (let customerIndex = 0; customerIndex < customers.length; customerIndex++) {
    const customer = customers[customerIndex]
    for (let orderIndex = 0; orderIndex < 6; orderIndex++) {
      const hasNote = Math.random() > 0.95

      const orderRows: OrderRowDto[] = []
      for (let productIdIndex = 0; productIdIndex < products.length; productIdIndex++) {
        const product = products[productIdIndex]
        orderRows.push({
          productId: product.id,
          amount: new Decimal(Math.floor(Math.random() * 10) * (product.packageSize || 1) + (Math.random() > 0.99 ? 0.5 : 0)),
          price: product.price || new Decimal(0.99).toDecimalPlaces(2),
          price0: product.price0 || new Decimal(0.99).div(1.14).toDecimalPlaces(2),
          packageSize: product.packageSize || 1,
          packageType: product.packageType || 'Ltk',
          freetext: Math.random() > 0.9 ? 'Erikoistuote' : null,
        })
      }

      await OrderService.createOrder({
        customerId: customer.id,
        tenantId: tenant.id,
        deliveryDate: subDays(new Date(), Math.floor(37 - orderIndex * 7 * Math.random())),
        hasNote,
        noteHeader: hasNote ? 'Toimitus' : null,
        noteBody: hasNote ? 'Toimitus ovelle H3. Nouto aamulla.' : null,
        orderRows,
      })
    }
  }

  // Test order creation with invalid price and price0
  try {
    const orderRows: OrderRowDto[] = [
      {
        productId: products[0].id,
        amount: new Decimal(1),
        price: new Decimal(1),
        price0: new Decimal(1),
        packageSize: 1,
        packageType: 'Ltk',
        freetext: null,
      },
    ]
    await OrderService.createOrder({
      tenantId: tenant.id,
      customerId: sello.id,
      deliveryDate: new Date(),
      hasNote: false,
      noteHeader: null,
      noteBody: null,
      orderRows,
    })
    throw new Error('Expected order creation with invalid IDs to fail')
  }
  catch (error) {
    // Expected error
    if (!(error instanceof Error) || !error.message.includes('Price and price0 do not match')) {
      throw new Error('Expected error to be instance of Error and to include "Price and price0 do not match"')
    }
  }

  const orders = await OrderService.getOrders({ tenantId: tenant.id })
  if (orders.length !== 12) {
    throw new Error(`Expected 12 orders, got ${orders.length}`)
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
    invoiceSwiftBic: '1111111111',
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
