import type request from 'supertest'

export class InvoiceFactory {
  static async createInvoice(agent: request.SuperAgentTest, data: { startDate: string, endDate: string, customerId: string }) {
    const res = await agent.get(`/api/invoices?startDate=${data.startDate}&endDate=${data.endDate}&customerId=${data.customerId}`).expect(200)
    return res
  }
}
