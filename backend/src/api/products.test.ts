import type { GetProductResponseDto, PostProductCreateRequestDto } from '@siikli/shared'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createApp } from '../app'
import redisClient from '../redis'

async function createProduct(agent: request.SuperAgentTest, data: Record<string, any>) {
  const res = await agent.post('/api/products').send(data).expect(201)
  return res.body.id
}

async function getProducts(agent: request.SuperAgentTest): Promise<GetProductResponseDto[]> {
  const res = await agent.get('/api/products').expect(200)
  return res.body
}

async function updateProduct(agent: request.SuperAgentTest, id: string, data: Record<string, any>) {
  await agent.put(`/api/products/${id}`).send(data).expect(200)
}

async function deleteProduct(agent: request.SuperAgentTest, id: string) {
  await agent.delete(`/api/products/${id}`).expect(200)
}

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
    createdProductId = await createProduct(agent, { name: 'Sieglinde, simple' })
    expect(createdProductId).toBeTruthy()
  })

  it('should create a product with all fields', async () => {
    const productData = {
      name: 'Sieglinde, all fields',
      price: '19.99',
      packageSize: 10,
      packageType: 'Box',

    } satisfies PostProductCreateRequestDto
    const id = await createProduct(agent, productData)
    const products = await getProducts(agent)
    console.log(products)
    const product = products.find((p: any) => p.id === id)
    expect(product).toMatchObject({
      id,
      name: productData.name,
      price: productData.price.toString(),
    })
  })

  it('should fetch the created product', async () => {
    const products = await getProducts(agent)
    expect(Array.isArray(products)).toBe(true)
    const product = products.find((p: any) => p.id === createdProductId)
    expect(product).toBeTruthy()
    expect(product?.name).toBe('Sieglinde, simple')
  })

  it('should update the product by id', async () => {
    const updateData = { name: 'Sieglinde, updated', price: '29.99' }
    await updateProduct(agent, createdProductId, updateData)
    const products = await getProducts(agent)
    const product = products.find((p: any) => p.id === createdProductId)
    expect(product).toBeDefined()
    expect(product?.name).toBe(updateData.name)
    expect(product?.price).toBe(updateData.price.toString())
  })

  it('should delete the product by id', async () => {
    await deleteProduct(agent, createdProductId)
    const products = await getProducts(agent)
    const product = products.find((p: any) => p.id === createdProductId)
    expect(product).toBeUndefined()
    // There should be only one product left (from the "all fields" test)
    expect(products.length).toBe(1)
  })
})
