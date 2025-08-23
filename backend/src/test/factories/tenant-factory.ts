import type { User } from '@prisma/client'
import type { CreateTenantDto } from '@siikli/shared'
import { faker } from '@faker-js/faker'
import prisma from '../../prisma'
import { TenantService } from '../../services/tenant-service'

export const TenantFactory = {
  async createTenant(overrides: Partial<CreateTenantDto> = {}) {
    const tenant = await TenantService.createTenant({
      name: faker.company.name(),
      businessId: '1234567-8',
      streetAddress: faker.location.streetAddress(),
      postalCode: '12345',
      city: 'Helsinki',
      phone: faker.phone.number(),
      email: faker.internet.email(),
      website: faker.internet.url(),
      invoiceBankName: 'Test bank',
      invoiceBankAccount: '1234567890',
      invoiceSumRow: 'Test sum row',
      signupCompleted: true,
      subscriptionType: 'PREMIUM',
      subscriptionEndDate: null,
      subscriptionStartDate: null,
      ...overrides,
    },
    )
    return tenant
  },
  async createUser(tenantId: string, overrides: Partial<User> = {}) {
    const user = await prisma.user.create({
      data: {
        tenantId,
        email: faker.internet.email(),
        role: 'USER',
        ...overrides,
      },
    })
    return user
  },
}
