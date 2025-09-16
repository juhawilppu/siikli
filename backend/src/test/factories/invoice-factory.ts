import type { PostCreateInvoiceRequest } from '@siikli/shared'
import type request from 'supertest'
import type z from 'zod'

export const InvoiceFactory = {
  async createInvoice(agent: request.SuperAgentTest, data: z.infer<typeof PostCreateInvoiceRequest>) {
    const res = await agent.post(`/api/invoices`).send(data).expect(200)
    return res
  },
}
