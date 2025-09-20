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
    expect(res.body).toHaveProperty('version', 'v1')
  })
})
