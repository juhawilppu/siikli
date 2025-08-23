import type { GetOrderDto, GetOrderListDto, PostOrderRequestDto } from '@siikli/shared'
import type request from 'supertest'
import type { GetOrderLimitResponseDto } from '../../api/orders'

export class OrderFactory {
  static async createOrder(agent: request.SuperAgentTest, data: PostOrderRequestDto) {
    const res = await agent.post('/api/orders').send(data).expect(201)
    return res.body
  }

  static async getOrder(agent: request.SuperAgentTest, id: string): Promise<GetOrderDto> {
    const res = await agent.get(`/api/orders/${id}`).expect(200)
    return res.body
  }

  static async getOrders(agent: request.SuperAgentTest, startDate: string, endDate: string): Promise<GetOrderListDto[]> {
    const res = await agent.get(`/api/orders?startDate=${startDate}&endDate=${endDate}`).expect(200)
    return res.body
  }

  static async updateOrder(agent: request.SuperAgentTest, id: string, data: PostOrderRequestDto) {
    await agent.post(`/api/orders/${id}`).send(data).expect(200)
  }

  static async getOrderLimit(agent: request.SuperAgentTest): Promise<GetOrderLimitResponseDto> {
    const res = await agent.get('/api/orders/limit').expect(200)
    return res.body.remaining
  }

  static async deleteOrder(agent: request.SuperAgentTest, id: string) {
    await agent.delete(`/api/orders/${id}`).expect(200)
  }
}
