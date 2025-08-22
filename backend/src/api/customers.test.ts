import request from 'supertest'

import { describe, expect, it } from 'vitest'

import { createApp } from '../app'

describe('post /api/customers', () => {
  it('creates customer (201)', async () => {
    const app = await createApp()
    const agent = request.agent(app)

    console.log('cheking pin')
    await agent.post('/api/auth/email/check-pin').send({
      email: 'test@example.com',
      pinCode: '123456',
    }).expect(302)

    console.log('creating customer')
    const res = await agent
      .post('/api/customers')
      .send({ name: 'John Doe', email: 'john.doe@example.com' })

    expect(res.status).toBe(201)
    expect(res.body.id).toBeTruthy()
  })
})
