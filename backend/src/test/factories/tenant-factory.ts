import type { Tenant, User } from '@prisma/client'
import type { z } from 'zod'
import { faker } from '@faker-js/faker'
import { addMonths } from 'date-fns'
import prisma from '../../prisma'

export const TenantFactory = {
  async createTenant(overrides: Partial<Tenant> = {}) {
    const tenant = await prisma.tenant.create({
      data: {
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
        trialEndDate: addMonths(new Date(), 1),
        ...overrides,
      },
    })
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
