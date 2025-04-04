import { PrismaClient } from '@prisma/client'
import express from 'express'

const productsRoute = express.Router()
const prisma = new PrismaClient()

productsRoute.get(`/api/products`, async (req, res) => {
  console.log('getting products')
  const result = await prisma.product.findMany({
    orderBy: {
      name: 'asc',
    },
  })
  res.json(result)
})


productsRoute.post(`/api/products`, async (req, res) => {
  console.log('saving product')
  const result = await prisma.product.create({
    data: {
      name: req.body.name,
      type: req.body.type,
      variety: req.body.variety,
      info: req.body.info,
      price0: parseFloat(req.body.price0),
      price: parseFloat(req.body.price),
      order_index: 1,
      subtype: req.body.subtype,
      package_size: req.body.package_size,
      package_type: req.body.package_type,
      customer_group: req.body.customer_group
    }
  })
  res.json(result)
})

export default productsRoute
