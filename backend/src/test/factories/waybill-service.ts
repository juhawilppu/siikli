import type { CreateWaybillsRequest } from '@siikli/shared'
import type request from 'supertest'
import type z from 'zod'

export class WaybillFactory {
  static async createWaybill(agent: request.SuperAgentTest, data: z.infer<typeof CreateWaybillsRequest>) {
    const res = await agent.post('/api/orders/waybills').send(data)
    return res
  }
}
