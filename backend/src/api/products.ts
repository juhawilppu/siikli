import type { GetProductsResponse, IdAsBodyDto } from '@siikli/shared'
import { Decimal } from '@prisma/client/runtime/library'
import { IdParams, PostCreateProductRequest } from '@siikli/shared'
import express from 'express'
import { getSessionOrThrow, isAuthenticated } from '../middlewares/permissions'
import { ProductService } from '../services/product-service'
import { serializeNumber } from '../utils/serialization'

const productsRoute = express.Router()

productsRoute.get(`/api/products`, isAuthenticated, async (req, res) => {
  const { tenantId } = getSessionOrThrow(req)

  const products = await ProductService.getProducts(tenantId)
  res.status(200).json(products.map((p) => {
    return {
      id: p.id,
      name: p.name,
      price: p.price ? serializeNumber(p.price) : undefined,
      packageSize: p.packageSize,
      packageType: p.packageType,
    }
  }) satisfies GetProductsResponse[])
})

productsRoute.post(`/api/products`, isAuthenticated, async (req, res) => {
  const { tenantId, userId } = getSessionOrThrow(req)
  const body = PostCreateProductRequest.parse(req.body)

  const productId = await ProductService.createProduct({
    ...body,
    tenantId,
    userId,
    price: body.price ? new Decimal(body.price) : null,
    packageSize: body.packageSize ? body.packageSize : null,
    packageType: body.packageType ? body.packageType : null,
  })
  res.status(201).json({ id: productId } satisfies IdAsBodyDto)
})

productsRoute.delete(`/api/products/:id`, isAuthenticated, async (req, res) => {
  const { tenantId, userId } = getSessionOrThrow(req)
  const { id } = IdParams.parse(req.params)

  await ProductService.deleteProduct(id, tenantId, userId)
  res.status(204).end()
})

productsRoute.put(`/api/products/:id`, isAuthenticated, async (req, res) => {
  const { tenantId, userId } = getSessionOrThrow(req)
  const { id } = IdParams.parse(req.params)
  const body = PostCreateProductRequest.parse(req.body)

  await ProductService.updateProduct(id, tenantId, body, userId)
  res.status(204).end()
})

export default productsRoute
