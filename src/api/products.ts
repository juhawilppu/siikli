import { PrismaClient } from '@prisma/client'
import express from 'express'

const productsRoute = express.Router()
const prisma = new PrismaClient()

productsRoute.get(`/api/products`, async (req, res) => {
  console.log('getting products')
  const result = await prisma.product.findMany({
    orderBy: {
      order_index: 'asc',
    },
  })
  res.json(result)
})

export default productsRoute
