import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createApp } from '../app'
import redisClient from '../redis'

async function createCustomer(agent: request.SuperAgentTest, data: Record<string, any>) {
  const res = await agent.post('/api/customers').send(data).expect(201)
  return res.body.id
}

async function getCustomers(agent: request.SuperAgentTest) {
  const res = await agent.get('/api/customers').expect(200)
  return res.body.customers
}

async function updateCustomer(agent: request.SuperAgentTest, id: string, data: Record<string, any>) {
  await agent.put(`${'/api/customers'}/${id}`).send(data).expect(200)
}

async function deleteCustomer(agent: request.SuperAgentTest, id: string) {
  await agent.delete(`/api/customers/${id}`).expect(200)
}

describe('/api/customers', () => {
  let agent: request.SuperAgentTest
  let createdCustomerId: string

  beforeAll(async () => {
    const app = await createApp()
    agent = request.agent(app)
    await agent
      .post('/api/auth/email/check-pin')
      .send({ email: 'test-customers@example.com', pinCode: '123456' })
      .expect(302)
  })

  afterAll(async () => {
    await redisClient.quit()
  })

  it('should create a simple customer', async () => {
    createdCustomerId = await createCustomer(agent, { name: 'J-Store' })
    expect(createdCustomerId).toBeTruthy()
  })

  it('should create a customer with all fields', async () => {
    const customerData = {
      name: 'J-Store',
      email: 'j-store@example.com',
      discount: 10,
      invoiceReference: '1234567890',
      streetAddress: '123 Main St',
      postalCode: '12345',
      city: 'Anytown',
      phone: '1234567890',
      businessId: '1234567890',
    }
    const id = await createCustomer(agent, customerData)
    const customers = await getCustomers(agent)
    const customer = customers.find((c: any) => c.id === id)
    expect(customer).toMatchObject({
      id,
      name: customerData.name,
      email: customerData.email,
      discount: '10',
      invoiceReference: customerData.invoiceReference,
      streetAddress: customerData.streetAddress,
      postalCode: customerData.postalCode,
      city: customerData.city,
      phone: customerData.phone,
      businessId: customerData.businessId,
    })
  })

  it('should fetch the created customer', async () => {
    const customers = await getCustomers(agent)
    expect(Array.isArray(customers)).toBe(true)
    const customer = customers.find((c: any) => c.id === createdCustomerId)
    expect(customer).toBeTruthy()
    expect(customer.name).toBe('J-Store')
    expect(customer.email).toBeNull()
  })

  it('should update the customer by id', async () => {
    const updateData = { name: 'J-Store2', email: 'j-store2@example.com' }
    await updateCustomer(agent, createdCustomerId, updateData)
    const customers = await getCustomers(agent)
    const customer = customers.find((c: any) => c.id === createdCustomerId)
    expect(customer).toBeTruthy()
    expect(customer.name).toBe(updateData.name)
    expect(customer.email).toBe(updateData.email)
  })

  it('should delete the customer by id', async () => {
    await deleteCustomer(agent, createdCustomerId)
    const customers = await getCustomers(agent)
    const customer = customers.find((c: any) => c.id === createdCustomerId)
    expect(customer).toBeUndefined()
    // There should be only one customer left (from the "all fields" test)
    expect(customers.length).toBe(1)
  })
})
