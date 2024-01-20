import { PrismaClient } from '@prisma/client'
import express from 'express'

export const customersRoute = express.Router()
const prisma = new PrismaClient()

customersRoute.get(`/api/customers`, async (req, res) => {
  console.log('getting orders')
  const result = await prisma.order.findMany({})
  res.json(result)
})
