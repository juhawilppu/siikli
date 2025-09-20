import type { GetCompanySettingsResponse, GetOnboardingResponse, GetPackageSettingsResponse, GetUsersResponse, PostSubscriptionChangeResponse } from '@siikli/shared'
import { IdParams, PostAddUserRequest, PostCompanySettingsRequest, PostCompleteSignupRequest, PostSubscriptionChangeRequest, PutChangeUserRoleRequest } from '@siikli/shared'
import express from 'express'
import { BadRequestError, UnprocessableEntityError } from '../middlewares/error-handler'
import { getSessionOrThrow, isOwner } from '../middlewares/permissions'
import { rateLimitByUserAccount } from '../middlewares/rate-limit'
import { DEFAULT_INVOICE_SUMMARY_ROW } from '../services/invoice-html'
import { TenantService } from '../services/tenant-service'

export const tenantsRoute = express.Router()

tenantsRoute.get(`/api/tenants/onboarding`, rateLimitByUserAccount(20, 1), async (req, res) => {
  const { tenantId } = getSessionOrThrow(req)

  const result = await TenantService.getOnboarding(tenantId)
  res.json({
    productCreated: result.productCreated,
    customerCreated: result.customerCreated,
    orderCreated: result.orderCreated,
    invoiceCreated: result.invoiceCreated,
    waybillCreated: result.waybillCreated,
    bankInformationSet: result.bankInformationSet,
  } satisfies GetOnboardingResponse)
})

tenantsRoute.get(`/api/tenants`, rateLimitByUserAccount(20, 1), async (req, res) => {
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
  } satisfies GetCompanySettingsResponse)
})

tenantsRoute.get(`/api/tenants/users`, rateLimitByUserAccount(20, 1), async (req, res) => {
  const { tenantId } = getSessionOrThrow(req)

  const users = await TenantService.getUsers(tenantId)
  res.json(
    users.map(user => ({
      id: user.id,
      email: user.email,
      role: user.role,
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    })) satisfies GetUsersResponse[],
  )
})

tenantsRoute.get(`/api/tenants/package-settings`, rateLimitByUserAccount(20, 1), async (req, res) => {
  const { tenantId } = getSessionOrThrow(req)

  const packageTypes = await TenantService.getPackageTypes(tenantId)
  const packageSizes = await TenantService.getPackageSizes(tenantId)
  res.json({
    packageTypes: packageTypes.map(row => row.name),
    packageSizes: packageSizes.map(row => row.size),
  } satisfies GetPackageSettingsResponse)
})

// TODO: should be PUT
tenantsRoute.post(`/api/tenants`, rateLimitByUserAccount(10, 1), async (req, res) => {
  const { tenantId, userId } = getSessionOrThrow(req)
  const body = PostCompanySettingsRequest.parse(req.body)

  await TenantService.updateTenant(tenantId, body, userId)
  res.status(204).end()
})

// TODO This is a bit too simple / dangerous if there is a coding mistake or XSS.
tenantsRoute.delete(`/api/tenants`, isOwner, rateLimitByUserAccount(10, 1), async (req, res) => {
  const { tenantId, userId } = getSessionOrThrow(req)

  await TenantService.deleteTenant(tenantId, userId)
  res.status(204).end()
})

tenantsRoute.delete(`/api/tenants/users/:id`, isOwner, rateLimitByUserAccount(10, 1), async (req, res) => {
  const { userId, tenantId } = getSessionOrThrow(req)
  const { id: userIdToDelete } = IdParams.parse(req.params)

  if (userIdToDelete === userId) {
    throw new BadRequestError('You cannot delete yourself')
  }

  await TenantService.deleteUser(tenantId, userIdToDelete, userId)
  res.status(204).end()
})

tenantsRoute.post(`/api/tenants/users`, isOwner, rateLimitByUserAccount(10, 1), async (req, res) => {
  const { userId, tenantId } = getSessionOrThrow(req)
  const body = PostAddUserRequest.parse(req.body)

  await TenantService.createUser(tenantId, body.email, body.role, userId)
  res.status(204).end()
})

tenantsRoute.put(`/api/tenants/users/:id`, isOwner, rateLimitByUserAccount(10, 1), async (req, res) => {
  const { tenantId, userId } = getSessionOrThrow(req)
  const { id: userIdToUpdate } = IdParams.parse(req.params)
  const body = PutChangeUserRoleRequest.parse(req.body)

  if (userIdToUpdate === userId) {
    throw new UnprocessableEntityError('You cannot edit yourself')
  }

  await TenantService.updateUser(tenantId, userIdToUpdate, body.role, userId)
  res.status(204).end()
})

tenantsRoute.post(`/api/tenants/subscription`, rateLimitByUserAccount(10, 1), async (req, res) => {
  const { tenantId, userId } = getSessionOrThrow(req)
  const body = PostSubscriptionChangeRequest.parse(req.body)

  const result = await TenantService.updateSubscription(tenantId, body.subscription, userId)
  res.status(200).json({
    subscriptionType: result.subscriptionType,
    subscriptionEndDate: result.subscriptionEndDate?.toISOString() ?? null,
    subscriptionStartDate: result.subscriptionStartDate?.toISOString() ?? null,
    trialEndDate: result.trialEndDate?.toISOString() ?? null,
  } satisfies PostSubscriptionChangeResponse)
})

tenantsRoute.post(`/api/tenants/complete-signup`, rateLimitByUserAccount(10, 1), async (req, res) => {
  const { tenantId, userId } = getSessionOrThrow(req)
  const body = PostCompleteSignupRequest.parse(req.body)

  await TenantService.completeSignup(tenantId, body, userId)
  res.status(204).end()
})
