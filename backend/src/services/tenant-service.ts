import type { PackageSize, PackageType, Tenant, User } from '@prisma/client'
import type { PostCompleteSignupRequest } from '@siikli/shared'
import type { z } from 'zod'
import { Role } from '@prisma/client'
import { addMonths } from 'date-fns'
import prisma from '../prisma'
import { sendEmail, sendEventEmail } from './email-service'

const TRIAL_DURATION_MONTHS = 1

export class TenantService {
  static async createUserAndTenant(email: string, googleExternalId?: string): Promise<{ tenant: Tenant, user: User }> {
    const { tenant, user } = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: '',
          signupCompleted: false,
          subscriptionType: 'PREMIUM',
          subscriptionEndDate: null,
          trialEndDate: addMonths(new Date(), TRIAL_DURATION_MONTHS).toISOString(),
        },
      })

      await tx.log.create({
        data: {
          data: { email, tenantId: tenant.id },
          event: 'tenant-created',
        },
      })

      const user = await tx.user.create({
        data: {
          email,
          tenantId: tenant.id,
          googleExternalId,
          role: Role.OWNER,
          lastLoginAt: new Date(),
        },
      })

      await tx.log.create({
        data: {
          data: { email, tenantId: tenant.id, googleExternalId },
          event: 'user-created',
        },
      })

      return { tenant, user }
    })

    await sendEmail(email, 'Juha Wilppu <juha.wilppu@siikli.fi>', 'Tervetuloa Siikliin', `
    <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;" >
    <p>Hei, ja tervetuloa Siikliin!</p>
  
    <p>Olen Juha, Siiklin kehittäjä.</p>
  
    <p>Parhaiten pääset alkuun kirjautumalla sisään ja luomalla ensimmäisen tilauksen tai tuotteen. Jos tarvitset apua, voit laittaa viestiä suoraan minulle.</p>
  
    <p>➡️ <a href="https://siikli.fi" style="color: #1a73e8;">Kirjaudu Siikliin</a></p>
  
    <p>Kiitos että käytät Siikliä &ndash; se auttaa minua kehittämään palvelusta entistä paremman.</p>
  
    <hr style="margin: 2em 0;" />
  
    <p style="margin-top: 2em; font-size: 14px; color: #666;">
    Kyllä, tämä viesti on automatisoitu &ndash; mutta olen oikea ihminen ja luen jokaisen vastauksen.
    </p>
  
    <p style="margin-top: 1em;">
    Terveisin,<br />
    Juha Wilppu<br />
    Siikli
    </p>
    </div>
    `)

    await sendEventEmail('New event: Welcome message', `A new welcome message was just sent to ${email}`)

    return { tenant, user }
  }

  static async completeSignup(tenantId: string, input: z.infer<typeof PostCompleteSignupRequest>, adminUserId: string): Promise<Tenant> {
    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.update({
        data: {
          name: input.name,
          signupCompleted: true,
        },
        where: {
          id: tenantId,
        },
      })

      await tx.user.update({
        data: {
          marketingConsent: input.user.marketingConsent,
        },
        where: {
          id: adminUserId,
        },
      })

      await tx.log.create({
        data: {
          userId: adminUserId,
          tenantId,
          event: 'create_tenant',
        },
      })

      return tenant
    })
    await sendEventEmail('Tenant completed onboarding', `Tenant: ${tenantId}\nUser: ${adminUserId}`)
    return result
  }

  static async updateTenant(tenantId: string, input: Partial<Tenant>, userId: string): Promise<Tenant> {
    const {
      name,
      businessId,
      streetAddress,
      postalCode,
      city,
      invoiceBankName,
      invoiceBankAccount,
      invoiceSumRow,
      phone,
      email,
      website,
    } = input
    const result = await prisma.$transaction(async (tx) => {
      const updatedTenant = await tx.tenant.update({
        data: {
          name,
          businessId,
          streetAddress,
          postalCode,
          city,
          invoiceBankName,
          invoiceBankAccount,
          invoiceSumRow,
          phone,
          email,
          website,
        },
        where: {
          id: tenantId,
        },
      })

      await tx.log.create({
        data: {
          userId,
          tenantId,
          event: 'update_tenant',
        },
      })

      return updatedTenant
    })

    return result
  }

  static async createPackageSize(tenantId: string, size: number): Promise<PackageSize> {
    const packageSize = await prisma.$transaction(async (tx) => {
      const newPackageSize = await tx.packageSize.create({
        data: {
          size,
          tenantId,
        },
      })

      await tx.log.create({
        data: {
          tenantId,
          event: 'create_package_size',
          data: {
            size,
          },
        },
      })

      return newPackageSize
    })

    return packageSize
  }

  static async createPackageType(tenantId: string, name: string): Promise<PackageType> {
    const packageType = await prisma.$transaction(async (tx) => {
      const newPackageType = await tx.packageType.create({
        data: {
          name,
          tenantId,
        },
      })

      await tx.log.create({
        data: {
          tenantId,
          event: 'create_package_type',
          data: {
            name,
          },
        },
      })

      return newPackageType
    })

    return packageType
  }

  static async verifyPackageSizeAndType(packageType: string | null | undefined, packageSize: number | null | undefined, tenantId: string): Promise<{ packageType: boolean, packageSize: boolean }> {
    const created = {
      packageType: false,
      packageSize: false,
    }

    if (packageType) {
      const p = await prisma.packageType.findFirst({
        where: {
          name: packageType,
          tenantId,
        },
      })
      if (!p) {
        await prisma.packageType.create({
          data: {
            tenantId,
            name: packageType,
          },
        })
        created.packageType = true
      }
    }

    if (packageSize) {
      const s = await prisma.packageSize.findFirst({
        where: {
          size: packageSize,
          tenantId,
        },
      })
      if (!s) {
        await prisma.packageSize.create({
          data: {
            tenantId,
            size: packageSize,
          },
        })
        created.packageSize = true
      }
    }

    return created
  }

  static async getPackageSizes(tenantId: string): Promise<PackageSize[]> {
    const packageSizes = await prisma.packageSize.findMany({
      where: { tenantId },
    })
    return packageSizes
  }

  static async getPackageTypes(tenantId: string): Promise<PackageType[]> {
    const packageTypes = await prisma.packageType.findMany({
      where: { tenantId },
    })
    return packageTypes
  }

  static async getTenant(id: string): Promise<Tenant> {
    const tenant = await prisma.tenant.findUnique({
      where: { id },
    })
    if (!tenant) {
      throw new Error(`Tenant with id ${id} not found`)
    }
    return tenant
  }

  static async getUsers(tenantId: string): Promise<User[]> {
    return await prisma.user.findMany({
      where: {
        tenantId,
      },
    })
  }

  static async deleteTenant(tenantId: string, userId: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await tx.tenant.delete({
        where: {
          id: tenantId,
        },
      })

      await tx.log.create({
        data: {
          userId,
          tenantId,
          event: 'delete_tenant',
        },
      })
    })
    await sendEventEmail('Tenant deleted', `Tenant: ${tenantId}\nUser: ${userId}`)
  }

  static async deleteUser(tenantId: string, userId: string, adminUserId: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.findFirstOrThrow({
        where: {
          id: tenantId,
        },
      })
      if (tenant.subscriptionType === 'FREE') {
        throw new Error('Free tenants cannot delete users')
      }

      await tx.user.delete({
        where: {
          id: userId,
          tenantId,
        },
      })
      await tx.log.create({
        data: {
          userId: adminUserId,
          tenantId,
          event: 'delete_user',
        },
      })
    })
    await sendEventEmail('User deleted', `Tenant: ${tenantId}\nUser: ${userId}\nAdmin: ${adminUserId}`)
  }

  static async createUser(tenantId: string, email: string, role: 'USER' | 'OWNER', adminUserId: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.findFirstOrThrow({
        where: {
          id: tenantId,
        },
      })
      if (tenant.subscriptionType === 'FREE') {
        throw new Error('Free tenants cannot add users')
      }
      await tx.user.create({
        data: {
          email,
          role,
          tenantId,
        },
      })
      await tx.log.create({
        data: {
          userId: adminUserId,
          tenantId,
          data: {
            email,
            role,
          },
          event: 'create_user',
        },
      })
    })
    await sendEventEmail('User invited', `Tenant: ${tenantId}\nUser: ${email}\nRole: ${role}`)
  }

  static async updateUser(tenantId: string, userId: string, role: 'USER' | 'OWNER', adminUserId: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.findFirstOrThrow({
        where: {
          id: tenantId,
        },
      })
      if (tenant.subscriptionType === 'FREE') {
        throw new Error('Free tenants cannot modify users')
      }

      await tx.user.update({
        data: { role },
        where: { id: userId, tenantId },
      })
      await tx.log.create({
        data: {
          userId: adminUserId,
          tenantId,
          data: { role },
          event: 'update_user',
        },
      })
    })
    await sendEventEmail('User role updated', `Tenant: ${tenantId}\nUser: ${userId}\nRole: ${role}\nAdmin: ${adminUserId}`)
  }

  static async updateSubscription(tenantId: string, subscription: 'FREE' | 'PREMIUM', adminUserId: string): Promise<Tenant> {
    const currentSubscription = await prisma.tenant.findFirst({
      where: {
        id: tenantId,
      },
    })
    const result = await prisma.$transaction(async (tx) => {
      const updatedTenant = await tx.tenant.update({
        data: {
          subscriptionType: subscription,
          subscriptionEndDate: subscription === 'FREE' ? addMonths(currentSubscription?.subscriptionStartDate || new Date(), 1).toISOString() : null,
          subscriptionStartDate: subscription === 'PREMIUM' ? new Date().toISOString() : null,
          trialEndDate: null,
        },
        where: {
          id: tenantId,
        },
      })
      await prisma.log.create({
        data: {
          userId: adminUserId,
          tenantId,
          event: 'update_tenant_subscription',
        },
      })
      await sendEventEmail('Subscription changed', `Tenant: ${tenantId}\nSubscription: ${subscription}`)
      return updatedTenant
    })
    return result
  }

  static async getOnboarding(tenantId: string) {
    const productCreated = await prisma.product.findFirst({
      where: {
        tenantId,
      },
    })
    const customerCreated = await prisma.customer.findFirst({
      where: {
        tenantId,
      },
    })
    const orderCreated = await prisma.order.findFirst({
      where: {
        tenantId,
      },
    })
    const invoiceCreated = await prisma.invoice.findFirst({
      where: {
        tenantId,
      },
    })
    const waybillCreated = await prisma.order.findFirst({
      where: {
        tenantId,
        waybillS3Key: {
          not: null,
        },
      },
    })
    const tenant = await prisma.tenant.findFirst({
      where: {
        id: tenantId,
      },
    })

    return {
      productCreated: !!productCreated,
      customerCreated: !!customerCreated,
      orderCreated: !!orderCreated,
      invoiceCreated: !!invoiceCreated,
      waybillCreated: !!waybillCreated,
      bankInformationSet: !!tenant?.invoiceBankName?.trim() && !!tenant?.invoiceBankAccount?.trim(),
    }
  }
}
