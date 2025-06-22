import type { OrderRowDto } from '../services/order-service'
import { Role } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { subDays } from 'date-fns'
import { describe, expect, it } from 'vitest'
import prisma from '../prisma'
import { AuthService } from '../services/auth-service'
import { CustomerService } from '../services/customer-service'
import { OrderService } from '../services/order-service'
import { ProductService } from '../services/product-service'
import { TenantService } from '../services/tenant-service'
import { UserService } from '../services/user-service'

describe('integration test', () => {
  it('should handle data changes', async () => {
    const tenantName = crypto.randomUUID()
    const tenantResponse = await TenantService.createTenant({
      name: tenantName,
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
    const tenant = await TenantService.getTenant(tenantResponse.id)
    expect(tenant.name).toBe(tenantName)

    const email = `${crypto.randomUUID()}@example.com`
    const juha = await UserService.createUser({
      email,
      tenantId: tenant.id,
      role: Role.OWNER,
    })
    expect(juha).toBeDefined()

    await AuthService.createPin({ email, ip: '127.0.0.1' })
    const pin = await prisma.emailLoginPinCode.findFirst({
      where: {
        email,
      },
    })
    expect(pin).toBeDefined()

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
    expect(sello).toBeDefined()

    const customers = await CustomerService.getCustomers(tenant.id, juha.id)
    expect(customers.customers.length).toBe(1)
    expect(customers.customers[0].name).toBe('Alepa Sello')

    const packageSizes = [5, 10, 20, 30, 50, 100, 200, 300]
    for (const size of packageSizes) {
      await TenantService.createPackageSize({ size, tenantId: tenant.id })
    }

    const packageTypes = ['Ltk', 'A', 'Pnt']
    for (const type of packageTypes) {
      await TenantService.createPackageType({ name: type, tenantId: tenant.id })
    }

    const siikli = await ProductService.createProduct({
      name: 'Siikli',
      tenantId: tenant.id,
      price: new Decimal(1.40),
      price0: new Decimal(1.40).div(1.14),
      packageSize: 10,
      packageType: 'Ltk',
    })
    expect(siikli).toBeDefined()

    await expect(ProductService.createProduct({
      name: 'Siikli',
      tenantId: tenant.id,
      price: new Decimal(1.40),
      price0: new Decimal(1.40), // This is wrong on purpose
      packageSize: 10,
      packageType: 'Ltk',
    })).rejects.toThrow('Price and price0 do not match')

    const products = await ProductService.getProducts(tenant.id)

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

    const deliveryDate = subDays(new Date(), 35)

    await OrderService.createOrder({
      customerId: customers.customers[0].id,
      tenantId: tenant.id,
      deliveryDate,
      hasNote: true,
      noteHeader: 'Toimitus',
      noteBody: 'Toimitus ovelle H3. Nouto aamulla.',
      orderRows,
    })

    const orders = await OrderService.getOrders(tenant.id)
    expect(orders.length).toBe(1)
    expect(orders[0].customerId).toBe(customers.customers[0].id)

    const order = await OrderService.getOrder(orders[0].id, tenant.id)
    expect(order.customerId).toBe(customers.customers[0].id)
    // expect(order.deliveryDate).toBe(deliveryDate)
    expect(order.hasNote).toBe(true)
    expect(order.noteHeader).toBe('Toimitus')
    expect(order.noteBody).toBe('Toimitus ovelle H3. Nouto aamulla.')
    expect(order.orderRows.length).toBe(products.length)
  })
})
