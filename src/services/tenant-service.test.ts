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
  it('can update a tenant without touching unchanged fields', async () => {
    const tenant = await TenantFactory.createTenant({ name: 'Test Tenant', businessId: '1234567-8' })
    const user = await TenantFactory.createUser(tenant.id, { role: 'OWNER' })
    await TenantService.updateTenant(tenant.id, { name: 'Updated Tenant' }, user.id)
    const tenantFromDb = await TenantService.getTenant(tenant.id)
    expect(tenantFromDb).toBeDefined()
    expect(tenantFromDb.name).toBe('Updated Tenant')

    // Make sure businessId was not updated
    expect(tenantFromDb.businessId).toBe('1234567-8')
  })
})
