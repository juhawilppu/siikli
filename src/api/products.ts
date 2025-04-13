import { PrismaClient } from '@prisma/client'
import express from 'express'
import { FullProductDto } from '../../frontend/src/types/types'

const productsRoute = express.Router()
const prisma = new PrismaClient()

productsRoute.get(`/api/products`, async (req, res) => {
  console.log('getting products')
  const products = await prisma.product.findMany({
    orderBy: {
      name: 'asc',
    },
  })
  res.json(products.map(p => {
    return {
      id: p.id,
      name: p.name,
      price: p.price,
      price0: p.price0,
      packageSize: p.package_size ? parseInt(p.package_size) : null,
      packageType: p.package_type,
      chain: p.customer_group,
      variety: p.variety,
      type: p.type,
      subtype: p.subtype,
      orderIndex: p.order_index || 0,
      info: p.info
    }
  }) satisfies FullProductDto[])
})

productsRoute.get(`/api/products/product-types`, async (req, res) => {
  console.log('getting products')
  const types = await prisma.product.findMany({
    distinct: ['type'],
    select: {
      type: true,
    },

  })
  res.status(200).json({ types: types.map(t => t.type) } satisfies { types: string[] })
})

productsRoute.post(`/api/products`, async (req, res) => {
  console.log('saving product')
  const body = req.body as FullProductDto
  const result = await prisma.product.create({
    data: {
      name: body.name,
      type: body.type,
      variety: body.variety,
      info: body.info,
      price0: body.price0,
      price: body.price,
      order_index: 1,
      subtype: body.subtype,
      package_size: body.packageSize + '',
      package_type: body.packageType,
      customer_group: body.chain
    }
  })
  res.status(201).json({ id: result.id })
})

productsRoute.post(`/api/products/:id`, async (req, res) => {
  const id = req.params.id
  console.log('updating product ' + id)

  const body = req.body as FullProductDto

  const result = await prisma.product.update({
    data: {
      name: body.name,
      type: body.type,
      variety: body.variety,
      info: body.info,
      price0: body.price0,
      price: body.price,
      order_index: 1,
      subtype: body.subtype,
      package_size: body.packageSize + '',
      package_type: body.packageType,
      customer_group: body.chain
    },
    where: {
      id
    }
  })
  res.json(result)
})

export default productsRoute
