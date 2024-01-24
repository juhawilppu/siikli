import { PrismaClient } from '@prisma/client'
import express from 'express'

const companiesRoute = express.Router()
const prisma = new PrismaClient()

companiesRoute.get(`/api/companies/:id`, async (req, res) => {
  const result = await prisma.company.findFirst({
    where: {
      id: parseInt(req.params.id as string),
    },
  })
  res.json(result)
})

companiesRoute.post(`/api/companies/:id`, async (req, res) => {
  const result = await prisma.company.update({
    data: {
      companyName: req.body.companyName,
      businessId: req.body.businessId,
      address1: req.body.address1,
      address2: req.body.address2,
      invoiceBankName: req.body.invoiceBankName,
      invoiceBankNumber: req.body.invoiceBankNumber,
      invoiceReference: req.body.invoiceReference,
      invoiceSumRow: req.body.invoiceSumRow,
    },
    where: {
      id: parseInt(req.params.id as string),
    },
  })
  res.json(result)
})

export default companiesRoute
