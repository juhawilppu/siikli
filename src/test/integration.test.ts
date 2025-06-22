import { Role } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { describe, expect, it } from 'vitest'
import prisma from '../prisma'
import { AuthService } from '../services/auth-service'
import { CustomerService } from '../services/customer-service'
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

    const products = await ProductService.getProducts(tenant.id)
    expect(products.length).toBe(1)
    expect(products[0].name).toBe('Siikli')
  })
})
