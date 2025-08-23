import type { CreateTenantDto, GetCompanySettings, GetPackageSettings, GetUsersResponseDto, PostCompanySettings, PostSubscriptionChangeRequest } from '@siikli/shared'
import express from 'express'
import { getSessionOrThrow, isAuthenticated, isOwner } from '../middlewares/permissions'
import { DEFAULT_INVOICE_SUMMARY_ROW } from '../services/invoice-html'
import { TenantService } from '../services/tenant-service'

const companiesRoute = express.Router()

companiesRoute.get(`/api/tenants`, isAuthenticated, async (req, res) => {
  const { tenantId } = getSessionOrThrow(req)

  const result = await TenantService.getTenant(tenantId)
  res.json({
    id: result.id,
    name: result.name,
    businessId: result.businessId,
    streetAddress: result.streetAddress,
    postalCode: result.postalCode,
    city: result.city,
    invoiceBankName: result.invoiceBankName,
    invoiceBankAccount: result.invoiceBankAccount,
    invoiceSumRow: result.invoiceSumRow || DEFAULT_INVOICE_SUMMARY_ROW,
    phone: result.phone,
    email: result.email,
    website: result.website,
    subscriptionType: result.subscriptionType,
    subscriptionEndDate: result.subscriptionEndDate?.toISOString() ?? null,
    subscriptionStartDate: result.subscriptionStartDate?.toISOString() ?? null,
    trialEndDate: result.trialEndDate?.toISOString() ?? null,
  } satisfies GetCompanySettings)
})

companiesRoute.get(`/api/tenants/users`, isAuthenticated, async (req, res) => {
  const { tenantId } = getSessionOrThrow(req)

  const users = await TenantService.getUsers(tenantId)
  res.json(
    users.map(user => ({
      id: user.id,
      email: user.email,
      role: user.role,
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    })) satisfies GetUsersResponseDto[],
  )
})

companiesRoute.get(`/api/tenants/package-settings`, isAuthenticated, async (req, res) => {
  const { tenantId } = getSessionOrThrow(req)

  const packageTypes = await TenantService.getPackageTypes(tenantId)
  const packageSizes = await TenantService.getPackageSizes(tenantId)
  res.json({
    packageTypes: packageTypes.map(row => row.name),
    packageSizes: packageSizes.map(row => row.size),
  } satisfies GetPackageSettings)
})

companiesRoute.post(`/api/tenants`, isAuthenticated, async (req, res) => {
  const { tenantId, userId } = getSessionOrThrow(req)

  const body = req.body as PostCompanySettings
  await TenantService.updateTenant(tenantId, body, userId)
  res.json({ message: 'OK' })
})

companiesRoute.delete(`/api/tenants`, isAuthenticated, isOwner, async (req, res) => {
  const { tenantId, userId } = getSessionOrThrow(req)

  await TenantService.deleteTenant(tenantId, userId)
  res.status(200).end()
})

companiesRoute.delete(`/api/tenants/users/:userId`, isAuthenticated, isOwner, async (req, res) => {
  const { userId, tenantId } = getSessionOrThrow(req)

  if (req.params.userId === userId) {
    res.status(400).json({ message: 'You cannot delete yourself' })
    return
  }
  await TenantService.deleteUser(tenantId, req.params.userId, userId)
  res.status(200).end()
})

companiesRoute.post(`/api/tenants/users`, isAuthenticated, isOwner, async (req, res) => {
  const { userId, tenantId } = getSessionOrThrow(req)

  await TenantService.createUser(tenantId, req.body.email, req.body.role, userId)
  res.status(200).json({ message: 'OK' })
})

companiesRoute.put(`/api/tenants/users/:userId`, isAuthenticated, isOwner, async (req, res) => {
  const { tenantId, userId } = getSessionOrThrow(req)

  if (req.params.userId === userId) {
    res.status(400).json({ message: 'You cannot edit yourself' })
    return
  }

  await TenantService.updateUser(tenantId, req.params.userId, req.body.role, userId)
  res.status(200).json({ message: 'OK' })
})

companiesRoute.post(`/api/tenants/subscription`, isAuthenticated, async (req, res) => {
  const { tenantId, userId } = getSessionOrThrow(req)

  const body = req.body as { subscription: 'FREE' | 'PREMIUM' }
  const result = await TenantService.updateSubscription(tenantId, body.subscription, userId)
  res.status(200).json({
    subscriptionType: result.subscriptionType,
    subscriptionEndDate: result.subscriptionEndDate?.toISOString() ?? null,
    subscriptionStartDate: result.subscriptionStartDate?.toISOString() ?? null,
    trialEndDate: result.trialEndDate?.toISOString() ?? null,
  } satisfies PostSubscriptionChangeRequest)
})

companiesRoute.post(`/api/tenants/create`, isAuthenticated, async (req, res) => {
  const { tenantId, userId } = getSessionOrThrow(req)

  const body = req.body as CreateTenantDto
  const result = await TenantService.completeOnboarding(tenantId, body, userId)
  res.json(result)
})

export default companiesRoute
