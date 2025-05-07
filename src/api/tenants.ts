import { PrismaClient } from '@prisma/client'
import { addMonths } from 'date-fns'
import express from 'express'
import { CreateTenantDto, GetCompanySettings, PostCompanySettings } from '../../frontend/src/types/types'
import { getUser, isAuthenticated } from '../middlewares/permissions'
const companiesRoute = express.Router()
const prisma = new PrismaClient()

companiesRoute.get(`/api/tenants`, isAuthenticated, async (req, res) => {
  const { tenantId } = getUser(req)
  const result = await prisma.tenant.findFirst({
    where: {
      id: tenantId
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
    subscriptionType: 'PREMIUM',
    subscriptionEndDate: addMonths(result.createdAt, 3).toISOString(),
    trialEndDate: addMonths(result.createdAt, 3).toISOString(),
  } satisfies GetCompanySettings)
})

companiesRoute.post(`/api/tenants`, isAuthenticated, async (req, res) => {
  const { tenantId, userId } = getUser(req)
  const body = req.body as PostCompanySettings
  const result = await prisma.tenant.update({
    data: {
      name: body.name,
      businessId: body.businessId,
      streetAddress: body.address1,
      invoiceBankName: body.invoiceBankName,
      invoiceBankAccount: body.invoiceBankNumber,
      invoiceReference: body.invoiceReference,
      invoiceSumRow: body.invoiceSumRow,
    },
    where: {
      id: tenantId
    },
  })
  await prisma.log.create({
    data: {
      userId,
      tenantId,
      event: 'update_tenant',
    }
  })
  res.json(result)
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
      id: tenantId
    },
  })
  await prisma.user.update({
    data: {
      marketingConsent: body.user.marketingConsent,
    },
    where: {
      id: userId
    },
  })
  await prisma.log.create({
    data: {
      userId,
      tenantId,
      event: 'create_tenant',
    }
  })
  res.json(result)
})


export default companiesRoute
