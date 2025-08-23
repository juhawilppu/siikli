import type request from 'supertest'

export class CustomerFactory {
  static async createCustomer(agent: request.SuperAgentTest, data: Record<string, any>) {
    const res = await agent.post('/api/customers').send(data).expect(201)
    return res.body.id
  }

  static async getCustomers(agent: request.SuperAgentTest) {
    const res = await agent.get('/api/customers').expect(200)
    return res.body.customers
  }

  static async updateCustomer(agent: request.SuperAgentTest, id: string, data: Record<string, any>) {
    await agent.put(`${'/api/customers'}/${id}`).send(data).expect(200)
  }

  static async deleteCustomer(agent: request.SuperAgentTest, id: string) {
    await agent.delete(`/api/customers/${id}`).expect(200)
  }
}
