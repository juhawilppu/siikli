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
  it('can create a package size', async () => {
    const tenant = await TenantFactory.createTenant({ name: 'Test Tenant' })
    await TenantService.createPackageSize(tenant.id, 100)
    const packageSizes = await TenantService.getPackageSizes(tenant.id)
    expect(packageSizes).toBeDefined()
    expect(packageSizes.length).toBe(1)
    expect(packageSizes[0].size).toBe(100)
    expect(packageSizes[0].tenantId).toBe(tenant.id)
  })
  it('can create a package type', async () => {
    const tenant = await TenantFactory.createTenant({ name: 'Test Tenant' })
    await TenantService.createPackageType(tenant.id, 'Box')
    const packageTypes = await TenantService.getPackageTypes(tenant.id)
    expect(packageTypes).toBeDefined()
    expect(packageTypes.length).toBe(1)
    expect(packageTypes[0].name).toBe('Box')
  })
  it('can verify package size and type', async () => {
    const tenant = await TenantFactory.createTenant({ name: 'Test Tenant' })
    await TenantService.verifyPackageSizeAndType('Box', 10, tenant.id)

    const packageTypes = await TenantService.getPackageTypes(tenant.id)
    expect(packageTypes).toBeDefined()
    expect(packageTypes.length).toBe(1)
    expect(packageTypes[0].name).toBe('Box')

    const packageSizes = await TenantService.getPackageSizes(tenant.id)
    expect(packageSizes).toBeDefined()
    expect(packageSizes.length).toBe(1)
    expect(packageSizes[0].size).toBe(10)
  })
  it('can get users', async () => {
    const tenant = await TenantFactory.createTenant({ name: 'Test Tenant' })
    await TenantFactory.createUser(tenant.id, { role: 'OWNER' })
    await TenantFactory.createUser(tenant.id, { role: 'USER' })
    const users = await TenantService.getUsers(tenant.id)
    expect(users).toBeDefined()
    expect(users.length).toBe(2)
    expect(users.find(u => u.role === 'OWNER')).toBeDefined()
    expect(users.find(u => u.role === 'USER')).toBeDefined()
  })
  it('can delete the tenant', async () => {
    const tenant = await TenantFactory.createTenant({ name: 'Test Tenant' })
    const user = await TenantFactory.createUser(tenant.id, { role: 'OWNER' })
    await TenantService.deleteTenant(tenant.id, user.id)
    await expect(TenantService.getTenant(tenant.id)).rejects.toThrow(`Tenant with id ${tenant.id} not found`)
  })
  it('can delete a user', async () => {
    const tenant = await TenantFactory.createTenant({ name: 'Test Tenant' })
    const user = await TenantFactory.createUser(tenant.id, { role: 'OWNER' })
    const user2 = await TenantFactory.createUser(tenant.id, { role: 'USER' })
    await TenantService.deleteUser(tenant.id, user2.id, user.id)
    const users = await TenantService.getUsers(tenant.id)
    expect(users).toBeDefined()
    expect(users.length).toBe(1)
  })
})
