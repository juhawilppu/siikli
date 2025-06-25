import type { CreateTenantDto, GetCompanySettings, GetPackageSettings, GetUsersResponseDto, PostCompanySettings, PostSubscriptionChangeRequest } from '../../frontend/src/types/types'
import { addMonths } from 'date-fns'
import express from 'express'
import { getUser, isAuthenticated, isOwner } from '../middlewares/permissions'
import prisma from '../prisma'
import { sendEventEmail } from '../services/email-service'
import { TenantService } from '../services/tenant-service'

const companiesRoute = express.Router()

companiesRoute.get(`/api/tenants`, isAuthenticated, async (req, res) => {
  const { tenantId } = getUser(req)
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
    invoiceReference: result.invoiceReference,
    invoiceSumRow: result.invoiceSumRow,
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
  const { tenantId } = getUser(req)
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
  const { tenantId } = getUser(req)
  const packageTypes = await TenantService.getPackageTypes(tenantId)
  const packageSizes = await TenantService.getPackageSizes(tenantId)
  res.json({
    packageTypes: packageTypes.map(row => row.name),
    packageSizes: packageSizes.map(row => row.size),
  } satisfies GetPackageSettings)
})

companiesRoute.post(`/api/tenants`, isAuthenticated, async (req, res) => {
  const { tenantId, userId } = getUser(req)
  const body = req.body as PostCompanySettings
  await TenantService.updateTenant(tenantId, body, userId)
  res.json({ message: 'OK' })
})

companiesRoute.delete(`/api/tenants`, isAuthenticated, isOwner, async (req, res) => {
  const { tenantId, userId } = getUser(req)
  await TenantService.deleteTenant(tenantId, userId)
  res.status(200).end()
})

companiesRoute.delete(`/api/tenants/users/:userId`, isAuthenticated, isOwner, async (req, res) => {
  const { userId, tenantId } = getUser(req)

  await TenantService.deleteUser(tenantId, req.params.userId, userId)
  res.status(200).end()
})

companiesRoute.post(`/api/tenants/users`, isAuthenticated, isOwner, async (req, res) => {
  const { userId, tenantId } = getUser(req)

  const tenant = await prisma.tenant.findFirstOrThrow({
    where: {
      id: tenantId,
    },
  })
  if (tenant.subscriptionType === 'FREE') {
    return res.status(403).json({ error: 'Free tenants cannot delete users' })
  }

  const body = req.body as { email: string, role: 'USER' | 'OWNER' }
  await prisma.user.create({
    data: {
      email: body.email,
      role: body.role,
      tenantId,
    },
  })
  await sendEventEmail('User invited', `Tenant: ${tenantId}\nUser: ${body.email}\nRole: ${body.role}`)
  await prisma.log.create({
    data: {
      userId,
      tenantId,
      data: {
        email: body.email,
        role: body.role,
      },
      event: 'create_user',
    },
  })
  res.status(200).json({ message: 'OK' })
})

companiesRoute.put(`/api/tenants/users/:userId`, isAuthenticated, isOwner, async (req, res) => {
  const { tenantId } = getUser(req)

  const tenant = await prisma.tenant.findFirstOrThrow({
    where: {
      id: tenantId,
    },
  })
  if (tenant.subscriptionType === 'FREE') {
    return res.status(403).json({ error: 'Free tenants cannot delete users' })
  }

  const body = req.body as { role: 'USER' | 'OWNER' }
  await prisma.user.update({
    data: { role: body.role },
    where: { id: req.params.userId, tenantId },
  })
  res.status(200).json({ message: 'OK' })
})

companiesRoute.post(`/api/tenants/subscription`, isAuthenticated, async (req, res) => {
  const { tenantId, userId } = getUser(req)
  const body = req.body as { subscription: 'FREE' | 'PREMIUM' }
  const currentSubscription = await prisma.tenant.findFirst({
    where: {
      id: tenantId,
    },
  })
  const result = await prisma.tenant.update({
    data: {
      subscriptionType: body.subscription,
      subscriptionEndDate: body.subscription === 'FREE' ? addMonths(currentSubscription?.subscriptionStartDate || new Date(), 1).toISOString() : null,
      subscriptionStartDate: body.subscription === 'PREMIUM' ? new Date().toISOString() : null,
      trialEndDate: null,
    },
    where: {
      id: tenantId,
    },
  })
  await prisma.log.create({
    data: {
      userId,
      tenantId,
      event: 'update_tenant_subscription',
    },
  })
  await sendEventEmail('Subscription changed', `Tenant: ${tenantId}\nSubscription: ${body.subscription}`)
  res.status(200).json({
    subscriptionType: result.subscriptionType,
    subscriptionEndDate: result.subscriptionEndDate?.toISOString() ?? null,
    subscriptionStartDate: result.subscriptionStartDate?.toISOString() ?? null,
    trialEndDate: result.trialEndDate?.toISOString() ?? null,
  } satisfies PostSubscriptionChangeRequest)
})

companiesRoute.post(`/api/tenants/create`, isAuthenticated, async (req, res) => {
  const { tenantId, userId } = getUser(req)
  const body = req.body as CreateTenantDto
  const result = await prisma.tenant.update({
    data: {
      name: body.name,
      businessId: req.body.businessId,
      signupCompleted: true,
    },
    where: {
      id: tenantId,
    },
  })
  await prisma.user.update({
    data: {
      marketingConsent: body.user.marketingConsent,
    },
    where: {
      id: userId,
    },
  })
  await sendEventEmail('Tenant completed onboarding', `Tenant: ${tenantId}\nUser: ${userId}`)
  await prisma.log.create({
    data: {
      userId,
      tenantId,
      event: 'create_tenant',
    },
  })
  res.json(result)
})

export default companiesRoute
