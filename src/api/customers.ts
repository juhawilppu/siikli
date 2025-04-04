import { PrismaClient } from '@prisma/client'
import express from 'express'

export const customersRoute = express.Router()
const prisma = new PrismaClient()

customersRoute.get(`/api/customers`, async (req, res) => {
  console.log('getting customers')
  const result = await prisma.customer.findMany({
    orderBy: {
      order_index: 'asc',
    },
  })
  res.json(result)
})


customersRoute.post(`/api/customers`, async (req, res) => {
  console.log('creating customer')
  console.log(req.body)
  const result = await prisma.customer.create({
    data: {
      chain: req.body.chain,
      name: req.body.name,
      compensation: parseInt(req.body.compensation)
    }
  })
  res.json(result)
})
