import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { createApp } from '../app'
import redisClient from '../redis'
import { log } from '../utils/app-log'

describe('/api/health', () => {
  let agent: request.SuperAgentTest

  beforeAll(async () => {
    process.env.NODE_ENV = 'development'
    const app = await createApp()
    agent = request.agent(app)
    await agent
      .post('/api/auth/email/check-pin')
      .send({ email: 'test-exceptions@example.com', pinCode: '123456' })
      .expect(302)
  })

  afterAll(async () => {
    await redisClient.quit()
  })

  it('should throw an error and return 400', async () => {
    const res = await agent.get('/api/testing/exception/400')
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch('BadRequest')
  })

  it('should log warnings using pino', async () => {
    // Mock log.warn before making the request
    vi.spyOn(log, 'warn')

    const res = await agent.get('/api/testing/exception/400')
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch('BadRequest')
    expect(res.body.message).toBe('Test throwing BadRequestError')

    // Verify log structure matches error handler format
    expect(log.warn).toHaveBeenCalledWith('Error handler caught:', {
      tenantId: expect.stringMatching(/^[a-f0-9-]{36}$/), // Random UUID
      userId: expect.stringMatching(/^[a-f0-9-]{36}$/), // Random UUID
      exception: 'BadRequestError',
      message: 'Test throwing BadRequestError',
      name: 'BadRequest',
      path: '/api/testing/exception/400',
      method: 'GET',
    })
  })

  it('should throw an error and return 401', async () => {
    const res = await agent.get('/api/testing/exception/401')
    expect(res.status).toBe(401)
    expect(res.body.error).toMatch('Unauthenticated')
  })

  it('should throw an error and return 403', async () => {
    const res = await agent.get('/api/testing/exception/403')
    expect(res.status).toBe(403)
    expect(res.body.error).toMatch('Forbidden')
  })

  it('should throw an error and return 420', async () => {
    const res = await agent.get('/api/testing/exception/429')
    expect(res.status).toBe(429)
    expect(res.body.error).toMatch('RateLimitReached')
  })

  it('should throw an error and return 500', async () => {
    const res = await agent.get('/api/testing/exception/500')
    expect(res.status).toBe(500)
    expect(res.body.error).toMatch('InternalServerError')
  })

  it('should log errors using pino', async () => {
    // Mock log.warn before making the request
    vi.spyOn(log, 'error')

    const res = await agent.get('/api/testing/exception/500')
    expect(res.status).toBe(500)
    expect(res.body.error).toMatch('InternalServerError')
    expect(res.body.message).toBe('Test throwing InternalServerError')

    // Verify log structure matches error handler format
    expect(log.error).toHaveBeenCalledWith('Error handler caught:', {
      tenantId: expect.stringMatching(/^[a-f0-9-]{36}$/), // Random UUID
      userId: expect.stringMatching(/^[a-f0-9-]{36}$/), // Random UUID
      exception: 'InternalServerError',
      message: 'Test throwing InternalServerError',
      name: 'InternalServerError',
      path: '/api/testing/exception/500',
      method: 'GET',
    })
  })
})
