import type { GetProductsResponse } from '@siikli/shared'
import type request from 'supertest'

export const ProductFactory = {
  async createProduct(agent: request.SuperAgentTest, data: Record<string, any>) {
    const res = await agent.post('/api/products').send(data).expect(201)
    return res.body.id
  },

  async getProducts(agent: request.SuperAgentTest): Promise<GetProductsResponse[]> {
    const res = await agent.get('/api/products').expect(200)
    return res.body
  },

  async updateProduct(agent: request.SuperAgentTest, id: string, data: Record<string, any>) {
    await agent.put(`/api/products/${id}`).send(data).expect(204)
  },

  async deleteProduct(agent: request.SuperAgentTest, id: string) {
    await agent.delete(`/api/products/${id}`).expect(204)
  },
}
