import type { GetOrderLimit, GetOrderResponse, GetOrdersResponse, PostCreateOrderRequest } from '@siikli/shared'
import type request from 'supertest'
import type z from 'zod'

export const OrderFactory = {
  async createOrder(agent: request.SuperAgentTest, data: z.infer<typeof PostCreateOrderRequest>): Promise<GetOrderResponse> {
    const res = await agent.post('/api/orders').send(data).expect(201)
    return res.body
  },

  async getOrder(agent: request.SuperAgentTest, id: string): Promise<GetOrderResponse> {
    const res = await agent.get(`/api/orders/${id}`).expect(200)
    return res.body
  },

  async getOrders(agent: request.SuperAgentTest, startDate: string, endDate: string): Promise<GetOrdersResponse[]> {
    const res = await agent.get(`/api/orders?startDate=${startDate}&endDate=${endDate}`).expect(200)
    return res.body
  },

  async updateOrder(agent: request.SuperAgentTest, id: string, data: z.infer<typeof PostCreateOrderRequest>) {
    await agent.post(`/api/orders/${id}`).send(data).expect(204)
  },

  async getGetOrderLimit(agent: request.SuperAgentTest): Promise<GetOrderLimit> {
    const res = await agent.get('/api/orders/limit').expect(200)
    return res.body.remaining
  },

  async deleteOrder(agent: request.SuperAgentTest, id: string) {
    await agent.delete(`/api/orders/${id}`).expect(204)
  },
}
