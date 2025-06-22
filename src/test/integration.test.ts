import { Role } from '@prisma/client'
import { describe, expect, it } from 'vitest'
import prisma from '../prisma'
import { AuthService } from '../services/auth-service'
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
  })
})
