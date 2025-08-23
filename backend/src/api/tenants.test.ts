import type { CreateTenantDto, GetCompanySettings, PostCompanySettings } from '@siikli/shared'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createApp } from '../app'
import redisClient from '../redis'

const updateTenantBody = {
  name: 'Test Tenant',
  businessId: '123456',
  streetAddress: 'Test Street',
  postalCode: '12345',
  city: 'Test City',
  invoiceBankName: 'Test Bank',
  invoiceBankAccount: '123456',
  invoiceSumRow: 'Test Sum Row',
  phone: '123456',
  email: 'test-tenants@example.com',
  website: 'https://test-tenants.com',
} satisfies PostCompanySettings

describe('/api/tenants', () => {
  let agent: request.SuperAgentTest

  beforeAll(async () => {
    const app = await createApp()
    agent = request.agent(app)
    await agent
      .post('/api/auth/email/check-pin')
      .send({ email: 'test-tenants@example.com', pinCode: '123456' })
      .expect(302)
  })

  afterAll(async () => {
    await redisClient.quit()
  })

  it('should create tenant', async () => {
    const body = {
      name: 'Test Tenant',
      user: {
        marketingConsent: true,
      },
    } satisfies CreateTenantDto

    const res = await agent.post('/api/tenants/create').send(body).expect(200)
    expect(res.body.id).toBeDefined()
  })

  it('should update subscription', async () => {
    const body = {
      subscription: 'PREMIUM',
    }

    const res = await agent.post('/api/tenants/subscription').send(body).expect(200)
    expect(res.body.subscriptionType).toBe('PREMIUM')
    expect(res.body.subscriptionEndDate).toBeDefined()
    expect(res.body.subscriptionStartDate).toBeDefined()
    expect(res.body.trialEndDate).toBeDefined()
  })

  it('should update tenant', async () => {
    await agent.post('/api/tenants').send(updateTenantBody).expect(200)
  })

  it('should get tenant', async () => {
    const res = await agent.get('/api/tenants').expect(200) as { body: GetCompanySettings }
    expect(res.body).toMatchObject(updateTenantBody)
  })
})
