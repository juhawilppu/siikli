import type { PostCreateProductRequest } from '@siikli/shared'
import type { z } from 'zod'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createApp } from '../app'
import redisClient from '../redis'
import { ProductFactory } from '../test/factories/product-factory'

describe('/api/products', () => {
  let agent: request.SuperAgentTest
  let createdProductId: string

  beforeAll(async () => {
    const app = await createApp()
    agent = request.agent(app)
    await agent
      .post('/api/auth/email/check-pin')
      .send({ email: 'test-products@example.com', pinCode: '123456' })
      .expect(302)
  })

  afterAll(async () => {
    await redisClient.quit()
  })

  it('should create a simple product', async () => {
    createdProductId = await ProductFactory.createProduct(agent, { name: 'Sieglinde, simple' })
    expect(createdProductId).toBeTruthy()
  })

  it('should create a product with all fields', async () => {
    const productData = {
      name: 'Sieglinde, all fields',
      price: '19.99',
      packageSize: 10,
      packageType: 'Box',

    } satisfies z.infer<typeof PostCreateProductRequest>
    const id = await ProductFactory.createProduct(agent, productData)
    const products = await ProductFactory.getProducts(agent)

    const product = products.find((p: any) => p.id === id)
    expect(product).toMatchObject({
      id,
      name: productData.name,
      price: productData.price.toString(),
    })
  })

  it('should fetch the created product', async () => {
    const products = await ProductFactory.getProducts(agent)
    expect(Array.isArray(products)).toBe(true)
    const product = products.find((p: any) => p.id === createdProductId)
    expect(product).toBeTruthy()
    expect(product?.name).toBe('Sieglinde, simple')
  })

  it('should update the product by id', async () => {
    const updateData = { name: 'Sieglinde, updated', price: '29.99' }
    await ProductFactory.updateProduct(agent, createdProductId, updateData)
    const products = await ProductFactory.getProducts(agent)
    const product = products.find((p: any) => p.id === createdProductId)
    expect(product).toBeDefined()
    expect(product?.name).toBe(updateData.name)
    expect(product?.price).toBe(updateData.price.toString())
  })

  it('should delete the product by id', async () => {
    await ProductFactory.deleteProduct(agent, createdProductId)
    const products = await ProductFactory.getProducts(agent)
    const product = products.find((p: any) => p.id === createdProductId)
    expect(product).toBeUndefined()
    // There should be only one product left (from the "all fields" test)
    expect(products.length).toBe(1)
  })
})
