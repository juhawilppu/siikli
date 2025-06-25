import type { PackageSize, PackageType, Tenant, User } from '@prisma/client'
import type { PostCompanySettings } from '../../frontend/src/types/types'
import { addMonths } from 'date-fns'
import prisma from '../prisma'
import { sendEventEmail } from './email-service'

interface TenantCreateInput {
  name: string
  businessId: string
  streetAddress: string
  postalCode: string
  city: string
  phone: string
  email: string
  website: string
  invoiceBankName: string
  invoiceBankAccount: string
  invoiceSwiftBic: string
  invoiceReference: string
  invoiceSumRow: string
  signupCompleted: boolean
  subscriptionType: 'FREE' | 'PREMIUM'
  subscriptionEndDate: Date | null
  subscriptionStartDate: Date | null
}

export const TenantService = {
  async createTenant(input: TenantCreateInput): Promise<Tenant> {
    const {
      name,
      businessId,
      streetAddress,
      postalCode,
      city,
      phone,
      email,
      website,
      invoiceBankName,
      invoiceBankAccount,
      invoiceSwiftBic,
      invoiceReference,
      invoiceSumRow,
      signupCompleted,
      subscriptionType,
      subscriptionEndDate,
      subscriptionStartDate,
    } = input

    const tenant = await prisma.$transaction(async (tx) => {
      const newTenant = await tx.tenant.create({
        data: {
          name,
          businessId,
          streetAddress,
          postalCode,
          city,
          phone,
          email,
          website,
          invoiceBankName,
          invoiceBankAccount,
          invoiceSwiftBic,
          invoiceReference,
          invoiceSumRow,
          signupCompleted,
          subscriptionType,
          subscriptionEndDate,
          subscriptionStartDate,
          trialEndDate: addMonths(new Date(), 3).toISOString(),
        },
      })

      await tx.log.create({
        data: {
          tenantId: newTenant.id,
          event: 'TENANT_CREATED',
        },
      })

      return newTenant
    })

    return tenant
  },

  async createPackageSize(input: { size: number, tenantId: string }): Promise<PackageSize> {
    const {
      size,
      tenantId,
    } = input
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
          event: 'PACKAGE_SIZE_CREATED',
          data: {
            size,
          },
        },
      })

      return newPackageSize
    })

    return packageSize
  },

  async createPackageType(input: { name: string, tenantId: string }): Promise<PackageType> {
    const {
      name,
      tenantId,
    } = input

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
          event: 'PACKAGE_TYPE_CREATED',
          data: {
            name,
          },
        },
      })

      return newPackageType
    })

    return packageType
  },
  async verifyPackageSizeAndType(packageType: string | null | undefined, packageSize: number | null | undefined, tenantId: string): Promise<{ packageType: boolean, packageSize: boolean }> {
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
        console.log('creating package type', packageType)
        await prisma.packageType.create({
          data: {
            tenantId,
            name: packageType,
          },
        })
        created.packageType = true
      }
      else {
        console.log('package type OK')
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
        console.log('creating package size', packageSize)
        await prisma.packageSize.create({
          data: {
            tenantId,
            size: packageSize,
          },
        })
        created.packageSize = true
      }
      else {
        console.log('package size OK')
      }
    }

    return created
  },
  async getPackageSizes(tenantId: string): Promise<PackageSize[]> {
    const packageSizes = await prisma.packageSize.findMany({
      where: { tenantId },
    })
    return packageSizes
  },
  async getPackageTypes(tenantId: string): Promise<PackageType[]> {
    const packageTypes = await prisma.packageType.findMany({
      where: { tenantId },
    })
    return packageTypes
  },
  async getTenant(id: string): Promise<Tenant> {
    const tenant = await prisma.tenant.findUnique({
      where: { id },
    })
    if (!tenant) {
      throw new Error(`Tenant with id ${id} not found`)
    }
    return tenant
  },
  async getUsers(tenantId: string): Promise<User[]> {
    return await prisma.user.findMany({
      where: {
        tenantId,
      },
    })
  },
  async updateTenant(tenantId: string, input: PostCompanySettings, userId: string): Promise<Tenant> {
    const {
      name,
      businessId,
      streetAddress,
      postalCode,
      city,
      invoiceBankName,
      invoiceSwiftBic,
      invoiceBankAccount,
      invoiceReference,
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
          invoiceSwiftBic,
          invoiceBankAccount,
          invoiceReference,
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
  },
  async deleteTenant(tenantId: string, userId: string): Promise<void> {
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
  },
}
