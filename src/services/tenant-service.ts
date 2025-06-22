import { PackageSize, PackageType, Tenant } from '@prisma/client'
import { addMonths } from 'date-fns'
import prisma from '../prisma'

interface TenantCreateInput {
  tenantId: string
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

    async createPackageSize(input: {size: number, tenantId: string}): Promise<PackageSize> {
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

    async createPackageType(input: {name: string, tenantId: string}): Promise<PackageType> {
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
    }
}