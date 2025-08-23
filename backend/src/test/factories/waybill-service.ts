import type request from 'supertest'

export class WaybillFactory {
  static async createWaybill(agent: request.SuperAgentTest, data: { startDate: string, endDate: string }) {
    const res = await agent.get(`/api/orders/waybills?startDate=${data.startDate}&endDate=${data.endDate}`)
    return res
  }
}
