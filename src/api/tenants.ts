import { PrismaClient } from '@prisma/client'
import express from 'express'
import { parseTenantId } from './orders'

const companiesRoute = express.Router()
const prisma = new PrismaClient()

companiesRoute.get(`/api/tenants`, async (req, res) => {
  const tenantId = parseTenantId(req)
  const result = await prisma.tenant.findFirst({
    where: {
      id: tenantId
    },
  })
  res.json(result)
})

companiesRoute.post(`/api/tenants/:id`, async (req, res) => {
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
      id: req.params.id as string
    },
  })
  res.json(result)
})

export default companiesRoute
