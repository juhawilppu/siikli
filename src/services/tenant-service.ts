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

        const tenant = await prisma.tenant.create({
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
        return tenant
    },

    async createPackageSize(input: {size: number, tenantId: string}): Promise<PackageSize> {
        const {
            size,
            tenantId,
        } = input

        const packageSize = await prisma.packageSize.create({
            data: {
                size,
                tenantId,
            },
        })
        return packageSize
    },

    async createPackageType(input: {name: string, tenantId: string}): Promise<PackageType> {
        const {
            name,
            tenantId,
        } = input

        const packageType = await prisma.packageType.create({
            data: {
                name,
                tenantId,
            },
        })
        return packageType
    }
}