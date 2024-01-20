import { PrismaClient } from '@prisma/client'
import express from 'express'

export const ordersRoute = express.Router()
const prisma = new PrismaClient()

ordersRoute.get(`/api/orders`, async (req, res) => {
  console.log('getting orders')
  const result = await prisma.order.findMany({})
  res.json(result)
})
