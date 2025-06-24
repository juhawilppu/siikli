import type { GetProductResponseDto, PostProductCreateRequestDto, ProductTypeResponse } from '../../frontend/src/types/types'
import { Decimal } from '@prisma/client/runtime/library'
import express from 'express'
import { getUser, isAuthenticated } from '../middlewares/permissions'
import prisma from '../prisma'
import { ProductService } from '../services/product-service'
import { TenantService } from '../services/tenant-service'
import { formatNumber } from '../utils/money'

const productsRoute = express.Router()

productsRoute.get(`/api/products`, isAuthenticated, async (req, res) => {
  console.log('getting products')
  const { tenantId } = getUser(req)
  const products = await ProductService.getProducts(tenantId)
  res.status(200).json(products.map((p) => {
    return {
      id: p.id,
      name: p.name,
      price: formatNumber(p.price),
      price0: formatNumber(p.price0),
      packageSize: p.packageSize,
      packageType: p.packageType,
      customerGroup: p.customerGroup,
      variety: p.variety,
      type: p.type,
      subtype: p.subtype,
      info: p.info,
    }
  }) satisfies GetProductResponseDto[])
})

productsRoute.get(`/api/products/product-types`, isAuthenticated, async (req, res) => {
  console.log('getting product-types')
  const { tenantId } = getUser(req)
  const productTypes = await ProductService.getProductTypes(tenantId)
  res.status(200).json(productTypes satisfies ProductTypeResponse[])
})

productsRoute.post(`/api/products`, isAuthenticated, async (req, res) => {
  console.log('saving product')
  const body = req.body as PostProductCreateRequestDto
  const { tenantId, userId } = getUser(req)

  const productId = await ProductService.createProduct({
    ...body,
    tenantId,
    userId,
    price: body.price ? new Decimal(body.price) : null,
    price0: body.price0 ? new Decimal(body.price0) : null,
    packageSize: body.packageSize ? body.packageSize : null,
    packageType: body.packageType ? body.packageType : null,
    type: body.type ? body.type : null,
    variety: body.variety ? body.variety : null,
    info: body.info ? body.info : null,
    subtype: body.subtype ? body.subtype : null,
    customerGroup: body.customerGroup ? body.customerGroup : null,
  })
  res.status(201).json({ id: productId })
})

productsRoute.delete(`/api/products/:id`, isAuthenticated, async (req, res) => {
  console.log('delete', req.body)
  const { tenantId, userId } = getUser(req)
  const id = req.params.id

  await ProductService.deleteProduct(id, tenantId, userId)
  res.status(200).json({ message: 'OK' })
})

/*
productsRoute.post(`/api/products/reorder`, isAuthenticated, async (req, res) => {
  console.log('reorder', req.body)
  const body = req.body as ReorderDto
  const { tenantId } = getUser(req)
  await prisma.product.update({
    data: {
      orderIndex: body.first.orderIndex,
    },
    where: {
      id: body.first.id,
      tenantId,
    },
  },
  )
  await prisma.product.update({
    data: {
      orderIndex: body.second.orderIndex,
    },
    where: {
      id: body.second.id,
      tenantId,
    },
  },
  )
  res.status(201).json({ message: 'OK' })
})
  */

productsRoute.post(`/api/products/:id`, isAuthenticated, async (req, res) => {
  const id = req.params.id
  console.log(`updating product ${id}`)
  const { tenantId } = getUser(req)
  const body = req.body as GetProductResponseDto

  await TenantService.verifyPackageSizeAndType(body.packageType, body.packageSize, tenantId)
  await ProductService.verifyProductTypeAndSubtype(body as any, tenantId)

  const result = await prisma.product.update({
    data: {
      name: body.name,
      type: body.type,
      variety: body.variety,
      info: body.info,
      price0: body.price0,
      price: body.price,
      subtype: body.subtype,
      packageSize: body.packageSize,
      packageType: body.packageType,
      customerGroup: body.customerGroup,
    },
    where: {
      id,
      tenantId,
    },
  })
  res.json(result)
})

export default productsRoute
