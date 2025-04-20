import { PrismaClient } from '@prisma/client'
import express from 'express'
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
  res.json(result)
})

companiesRoute.post(`/api/tenants`, isAuthenticated, async (req, res) => {
  const { tenantId, userId } = getUser(req)
  const result = await prisma.tenant.update({
    data: {
      name: req.body.companyName,
      businessId: req.body.businessId,
      streetAddress: req.body.address1,
      invoiceBankName: req.body.invoiceBankName,
      invoiceBankAccount: req.body.invoiceBankNumber,
      invoiceReference: req.body.invoiceReference,
      invoiceSumRow: req.body.invoiceSumRow,
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

export default companiesRoute
