import { PrismaClient } from '@prisma/client'
import express from 'express'
import { GetProductResponseDto, ProductTypeResponse, ReorderDto } from '../../frontend/src/types/types'
import { getUser, isAuthenticated } from '../middlewares/permissions'

const productsRoute = express.Router()
const prisma = new PrismaClient()

productsRoute.get(`/api/products`, isAuthenticated, async (req, res) => {
  console.log('getting products')
  const { tenantId } = getUser(req)
  const products = await prisma.product.findMany({
    where: {
      tenantId
    },
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
  }) satisfies GetProductResponseDto[])
})

productsRoute.get(`/api/products/product-types`, isAuthenticated, async (req, res) => {
  console.log('getting product-types')
  const { tenantId } = getUser(req)
  const rows = await prisma.productType.findMany({
    where: {
      tenantId
    },
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

const verifyProductTypeAndSubtype = async (body: { type: string, subtype: string }, tenantId: string) => {
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
        tenantId,
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
        tenantId,
        type: body.type,
        subtype: body.subtype,
        order_index: 0
      }
    })
  } else {
    console.log('subtype OK')
  }
}

productsRoute.post(`/api/products`, isAuthenticated, async (req, res) => {
  console.log('saving product')
  const body = req.body as GetProductResponseDto
  const { tenantId, userId } = getUser(req)
  await verifyProductTypeAndSubtype(body as any, tenantId)

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
      customer_group: body.chain,
      tenantId
    }
  })
  await prisma.log.create({
    data: {
      userId,
      tenantId,
      event: 'create_product',
      data: {
        product: result.id,
        name: result.name,
      }
    }
  })
  res.status(201).json({ id: result.id })
})

productsRoute.delete(`/api/products/:id`, isAuthenticated, async (req, res) => {
  console.log('delete', req.body)
  const { tenantId, userId } = getUser(req)
  const id = req.params.id
  try {
    await prisma.product.delete({
      where: {
        id,
        tenantId
      }
    })
    await prisma.log.create({
      data: {
        userId,
        tenantId,
        event: 'delete_product',
        data: {
          product: id,
        }
      }
    })
    res.status(200).json({ message: 'OK' })
  } catch (e) {
    res.status(400).json({ message: 'Failed' })
  }
})

productsRoute.post(`/api/products/reorder`, isAuthenticated, async (req, res) => {
  console.log('reorder', req.body)
  const body = req.body as ReorderDto
  const { tenantId } = getUser(req)
  await prisma.product.update({
    data: {
      order_index: body.first.orderIndex
    },
    where: {
      id: body.first.id,
      tenantId
    }
  }
  )
  await prisma.product.update({
    data: {
      order_index: body.second.orderIndex
    },
    where: {
      id: body.second.id,
      tenantId
    }
  }
  )
  res.status(201).json({ message: 'OK' })
})

productsRoute.post(`/api/products/:id`, isAuthenticated, async (req, res) => {
  const id = req.params.id
  console.log('updating product ' + id)
  const { tenantId } = getUser(req)
  const body = req.body as GetProductResponseDto

  await verifyProductTypeAndSubtype(body as any, tenantId)

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
      id,
      tenantId
    }
  })
  res.json(result)
})

export default productsRoute
