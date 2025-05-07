import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

import { Prisma } from '@prisma/client'

export function requireTenantFilterMiddleware(): Prisma.Middleware {
    return async (params, next) => {
        const isCustomerModel = params.model === 'Customer'
        const isFindAction =
            params.action === 'findMany' ||
            params.action === 'findFirst' ||
            params.action === 'findUnique' ||
            params.action === 'count' ||
            params.action === 'deleteMany' ||
            params.action === 'updateMany'

        if (isCustomerModel && isFindAction) {
            const where = params.args?.where

            const hasTenantFilter =
                where?.tenantId !== undefined ||
                (where?.AND && where.AND.some((cond: any) => cond.tenantId !== undefined)) ||
                (where?.OR && where.OR.some((cond: any) => cond.tenantId !== undefined))

            if (!hasTenantFilter) {
                throw new Error(`Missing tenantId filter for Customer query`)
            }
        }

        return next(params)
    }
}


prisma.$use(requireTenantFilterMiddleware())

export default prisma