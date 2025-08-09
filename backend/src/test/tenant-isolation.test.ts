import { describe, expect, it } from 'vitest'
import prisma from '../prisma'

describe('tenant isolation', () => {
  it('should throw exception when trying to query without tenant id', async () => {
    await expect(prisma.order.findMany()).rejects.toThrow('Missing tenantId filter for Order query')
    await expect(prisma.orderRow.findMany()).rejects.toThrow('Missing tenantId filter for OrderRow query')
    await expect(prisma.customer.findMany()).rejects.toThrow('Missing tenantId filter for Customer query')
    await expect(prisma.product.findMany()).rejects.toThrow('Missing tenantId filter for Product query')
    await expect(prisma.packageSize.findMany()).rejects.toThrow('Missing tenantId filter for PackageSize query')
    await expect(prisma.packageType.findMany()).rejects.toThrow('Missing tenantId filter for PackageType query')

    await expect(prisma.tenant.findMany()).rejects.toThrow('Missing id filter for Tenant query')
  })
})
