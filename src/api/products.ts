import { PrismaClient } from '@prisma/client'
import express from 'express'
import { FullProductDto, ProductTypeResponse, ReorderDto } from '../../frontend/src/types/types'

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
  console.log('getting product-types')
  const rows = await prisma.productType.findMany({
    include: {
      product_subtypes: true
    }
  });

  res.status(200).json(rows.map(r => {
    return {
      id: r.id,
      name: r.type!,
      orderIndex: r.order_index,
      subtypes: r.product_subtypes.map(s => {
        return {
          id: s.id,
          name: s.subtype!,
          orderIndex: s.order_index
        }
      })
    }
  }) satisfies ProductTypeResponse[])
})

const verifyProductTypeAndSubtype = async (body: { type: string, subtype: string }) => {
  console.log('checking type', body.type)
  const type = await prisma.productType.findFirst({
    where: {
      type: body.type
    }
  })
  if (!type) {
    console.log('creating type', body.type)
    await prisma.productType.create({
      data: {
        type: body.type,
        order_index: 0
      }
    })
  } else {
    console.log('type OK')
  }

  console.log('checking subtype', body.subtype)
  const subtype = await prisma.productSubtypes.findFirst({
    where: {
      type: body.type,
      subtype: body.subtype
    }
  })
  if (!subtype) {
    console.log('creating subtype', body.subtype)
    await prisma.productSubtypes.create({
      data: {
        type: body.type,
        subtype: body.subtype,
        order_index: 0
      }
    })
  } else {
    console.log('subtype OK')
  }
}

productsRoute.post(`/api/products`, async (req, res) => {
  console.log('saving product')
  const body = req.body as FullProductDto

  await verifyProductTypeAndSubtype(body as any)

  const result = await prisma.product.create({
    data: {
      name: body.name,
      type: body.type,
      variety: body.variety,
      info: body.info,
      price0: body.price0,
      price: body.price,
      order_index: body.orderIndex,
      subtype: body.subtype,
      package_size: body.packageSize + '',
      package_type: body.packageType,
      customer_group: body.chain
    }
  })
  res.status(201).json({ id: result.id })
})

productsRoute.delete(`/api/products/:id`, async (req, res) => {
  console.log('delete', req.body)
  const id = req.params.id
  try {
    await prisma.product.delete({
      where: {
        id
      }
    })
    res.status(200).json({ message: 'OK' })
  } catch (e) {
    res.status(400).json({ message: 'Failed' })
  }
})

productsRoute.post(`/api/products/reorder`, async (req, res) => {
  console.log('reorder', req.body)
  const body = req.body as ReorderDto
  await prisma.product.update({
    data: {
      order_index: body.first.orderIndex
    },
    where: {
      id: body.first.id
    }
  }
  )
  await prisma.product.update({
    data: {
      order_index: body.second.orderIndex
    },
    where: {
      id: body.second.id
    }
  }
  )
  res.status(201).json({ message: 'OK' })
})

productsRoute.post(`/api/products/:id`, async (req, res) => {
  const id = req.params.id
  console.log('updating product ' + id)

  const body = req.body as FullProductDto

  await verifyProductTypeAndSubtype(body as any)

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
