import { PrismaClient } from '@prisma/client'
import express from 'express'
import { CustomerDto } from '../../frontend/src/types/types'

export const customersRoute = express.Router()
const prisma = new PrismaClient()

customersRoute.get(`/api/customers`, async (req, res) => {
  console.log('getting customers')
  const result = await prisma.customer.findMany({
    orderBy: {
      order_index: 'asc',
    },
  })
  res.json(result.map(r => {
    return {
      id: r.id,
      chain: r.chain,
      name: r.name,
      streetAddress: r.address,
      postalCode: r.postal_code,
      city: r.city
    }
  }) satisfies CustomerDto[])
})


customersRoute.post(`/api/customers`, async (req, res) => {
  console.log('creating customer')
  console.log(req.body)
  const tenant = await prisma.tenant.findFirstOrThrow()
  const result = await prisma.customer.create({
    data: {
      tenant: {
        connect: {
          id: tenant.id
        }
      },
      chain: req.body.chain,
      name: req.body.name,
      compensation: parseInt(req.body.compensation)
    }
  })
  res.json(result)
})
