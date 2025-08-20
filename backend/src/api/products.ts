import type { GetProductResponseDto, PostProductCreateRequestDto } from '@siikli/shared'
import { Decimal } from '@prisma/client/runtime/library'
import express from 'express'
import { getUser, isAuthenticated } from '../middlewares/permissions'
import { ProductService } from '../services/product-service'
import { serializeNumber } from '../utils/serialization'

const productsRoute = express.Router()

productsRoute.get(`/api/products`, isAuthenticated, async (req, res) => {
  console.log('getting products')
  const { tenantId } = getUser(req)
  const products = await ProductService.getProducts(tenantId)
  res.status(200).json(products.map((p) => {
    return {
      id: p.id,
      name: p.name,
      price: p.price ? serializeNumber(p.price) : undefined,
      packageSize: p.packageSize,
      packageType: p.packageType,
    }
  }) satisfies GetProductResponseDto[])
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
    packageSize: body.packageSize ? body.packageSize : null,
    packageType: body.packageType ? body.packageType : null,
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

productsRoute.put(`/api/products/:id`, isAuthenticated, async (req, res) => {
  const id = req.params.id
  console.log(`updating product ${id}`)
  const { tenantId, userId } = getUser(req)
  const body = req.body as GetProductResponseDto

  await ProductService.updateProduct(id, tenantId, body, userId)
  res.status(200).json({ message: 'OK' })
})

export default productsRoute
