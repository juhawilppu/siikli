import type { Prisma } from '@prisma/client'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export function requireTenantFilterMiddleware(): Prisma.Middleware {
  return async (params, next) => {
    const isProtectedModel = ['Customer', 'Order', 'OrderRow', 'Product', 'ProductType', 'ProductSubtypes'].includes(params.model as string)
    const isFindAction
            = params.action === 'findMany'
              || params.action === 'findFirst'
              || params.action === 'findUnique'
              || params.action === 'count'
              || params.action === 'deleteMany'
              || params.action === 'updateMany'

    if (isProtectedModel && isFindAction) {
      const where = params.args?.where

      const hasTenantFilter
                = where?.tenantId !== undefined
                  || (where?.AND && where.AND.some((cond: any) => cond.tenantId !== undefined))
                  || (where?.OR && where.OR.some((cond: any) => cond.tenantId !== undefined))

      if (!hasTenantFilter) {
        throw new Error(`Missing tenantId filter for ${params.model} query`)
      }
    }

    return next(params)
  }
}

export function requireIdFilterForTenantTableMiddleware(): Prisma.Middleware {
  return async (params, next) => {
    const isProtectedModel = ['Tenant'].includes(params.model as string)
    const isFindAction
            = params.action === 'findMany'
              || params.action === 'findFirst'
              || params.action === 'findUnique'
              || params.action === 'count'
              || params.action === 'deleteMany'
              || params.action === 'updateMany'

    if (isProtectedModel && isFindAction) {
      const where = params.args?.where

      const hasTenantFilter
                = where?.id !== undefined
                  || (where?.AND && where.AND.some((cond: any) => cond.id !== undefined))
                  || (where?.OR && where.OR.some((cond: any) => cond.id !== undefined))

      if (!hasTenantFilter) {
        throw new Error(`Missing id filter for ${params.model} query`)
      }
    }

    return next(params)
  }
}

prisma.$use(requireTenantFilterMiddleware())
prisma.$use(requireIdFilterForTenantTableMiddleware())
export default prisma
