import type { CreateTenantDto, GetCompanySettings, GetPackageSettings, GetUsersResponseDto, PostCompanySettings, PostSubscriptionChangeRequest } from '../../frontend/src/types/types'
import { addMonths } from 'date-fns'
import express from 'express'
import { getUser, isAuthenticated, isOwner } from '../middlewares/permissions'
import prisma from '../prisma'
import { sendEventEmail } from '../services/email-service'

const companiesRoute = express.Router()

companiesRoute.get(`/api/tenants`, isAuthenticated, async (req, res) => {
  const { tenantId } = getUser(req)
  const result = await prisma.tenant.findFirst({
    where: {
      id: tenantId,
    },
  })
  if (!result) {
    return res.status(404).json({ error: 'Tenant not found' })
  }
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
  const users = await prisma.user.findMany({
    where: {
      tenantId,
    },
  })
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
  const packageTypes = await prisma.packageType.findMany({
    where: {
      tenantId,
    },
  })
  const packageSizes = await prisma.packageSize.findMany({
    where: {
      tenantId,
    },
  })
  res.json({
    packageTypes: packageTypes.map(row => row.name),
    packageSizes: packageSizes.map(row => row.size),
  } satisfies GetPackageSettings)
})

companiesRoute.post(`/api/tenants`, isAuthenticated, async (req, res) => {
  const { tenantId, userId } = getUser(req)
  const body = req.body as PostCompanySettings
  const result = await prisma.tenant.update({
    data: {
      name: body.name,
      businessId: body.businessId,
      streetAddress: body.streetAddress,
      postalCode: body.postalCode,
      city: body.city,
      invoiceBankName: body.invoiceBankName,
      invoiceBankAccount: body.invoiceBankAccount,
      invoiceReference: body.invoiceReference,
      invoiceSumRow: body.invoiceSumRow,
      phone: body.phone,
      email: body.email,
      website: body.website,
    },
    where: {
      id: tenantId,
    },
  })
  await prisma.log.create({
    data: {
      userId,
      tenantId,
      event: 'update_tenant',
    },
  })
  res.json(result)
})

companiesRoute.delete(`/api/tenants`, isAuthenticated, isOwner, async (req, res) => {
  const { tenantId, userId } = getUser(req)
  await prisma.tenant.delete({
    where: {
      id: tenantId,
    },
  })
  await prisma.log.create({
    data: {
      userId,
      tenantId,
      event: 'delete_tenant',
    },
  })
  await sendEventEmail('Tenant deleted', `Tenant: ${tenantId}\nUser: ${userId}`)
  res.status(200).end()
})

companiesRoute.delete(`/api/tenants/users/:userId`, isAuthenticated, isOwner, async (req, res) => {
  const { userId, tenantId } = getUser(req)
  await prisma.user.delete({
    where: {
      id: userId,
      tenantId,
    },
  })
  await prisma.log.create({
    data: {
      userId,
      tenantId,
      event: 'delete_user',
    },
  })
  res.status(200).end()
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
