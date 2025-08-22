import request from 'supertest'
import { beforeAll, describe, expect, it } from 'vitest'
import { createApp } from '../app'

describe('/api/health', () => {
  let agent: request.SuperAgentTest

  beforeAll(async () => {
    const app = await createApp()
    agent = request.agent(app)
  })

  it('should return 200 and OK message', async () => {
    process.env.VERSION = 'v1'
    const res = await agent.get('/api/health').expect(200)
    expect(res.body).toHaveProperty('message', 'OK')
    expect(res.body).toHaveProperty('node', 22)
    expect(res.body).toHaveProperty('version', 'v1')
  })

  it('should throw an error and return 500', async () => {
    const res = await agent.get('/api/exception')
    expect(res.status).toBe(500)
    expect(res.body.error).toMatch('Internal server error')
  })
})
