import { describe, expect, it } from 'vitest'
import { TenantFactory } from '../test/factories/tenant-factory'
import { TenantService } from './tenant-service'

describe('tenantService', () => {
  it('can create a tenant', async () => {
    const tenant = await TenantFactory.createTenant({ name: 'Test Tenant' })
    expect(tenant).toBeDefined()
    expect(tenant.name).toBe('Test Tenant')
  })
  it('can fetch a tenant', async () => {
    const tenant = await TenantFactory.createTenant({ name: 'Test Tenant' })
    const tenantFromDb = await TenantService.getTenant(tenant.id)
    expect(tenantFromDb).toBeDefined()
    expect(tenantFromDb.name).toBe('Test Tenant')
  })
})
