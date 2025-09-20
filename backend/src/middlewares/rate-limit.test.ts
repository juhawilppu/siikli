import type { NextFunction, Request, Response } from 'express'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import redisClient from '../redis'
import { rateLimitByIp, rateLimitByUserAccount } from './rate-limit'

describe('rate-limit middleware', () => {
  let mockReq: Partial<Request>
  let mockRes: Partial<Response>
  let nextFunction: NextFunction

  beforeAll(async () => {
    await redisClient.connect()
  })

  beforeEach(async () => {
    mockReq = {
      ip: '127.0.0.1',
      url: '/test',
      method: 'GET',
    }
    mockRes = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
      setHeader: vi.fn(),
    }
    nextFunction = vi.fn()

    // Clear all rate limit keys before each test
    const keys = await redisClient.keys('rate-limit:*')
    if (keys.length > 0) {
      await redisClient.del(keys)
    }
  })

  afterEach(async () => {
    // Clean up rate limit keys after each test
    const keys = await redisClient.keys('rate-limit:*')
    if (keys.length > 0) {
      await redisClient.del(keys)
    }
  })

  afterAll(async () => {
    await redisClient.quit()
  })

  describe('rateLimitByIp', () => {
    it('should allow requests within limit', async () => {
      const middleware = rateLimitByIp(2, 5)
      await middleware(mockReq as Request, mockRes as Response, nextFunction)

      const key = 'rate-limit:/test:GET:127.0.0.1'
      const attempts = await redisClient.get(key)
      const ttl = await redisClient.ttl(key)

      expect(attempts).toBe('1')
      expect(ttl).toBeGreaterThan(0)
      expect(ttl).toBeLessThanOrEqual(300)
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 2)
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 1)
      expect(nextFunction).toHaveBeenCalled()
    })

    it('should block requests over limit', async () => {
      const middleware = rateLimitByIp(2, 5)
      const key = 'rate-limit:/test:GET:127.0.0.1'

      // Make 3 requests
      await middleware(mockReq as Request, mockRes as Response, nextFunction)
      await middleware(mockReq as Request, mockRes as Response, nextFunction)
      await middleware(mockReq as Request, mockRes as Response, nextFunction)

      const attempts = await redisClient.get(key)
      expect(attempts).toBe('3')
      expect(mockRes.status).toHaveBeenCalledWith(429)
      expect(mockRes.send).toHaveBeenCalledWith({ error: 'RateLimitReached' })
      expect(nextFunction).toHaveBeenCalledTimes(2)
    })
    it('should return error if IP not found', async () => {
      const middleware = rateLimitByIp(2, 5)
      mockReq = { ...mockReq, ip: undefined }

      await expect(middleware(mockReq as Request, mockRes as Response, nextFunction)).rejects.toThrow('Request had no IP address')
    })
  })

  describe('rateLimitByUserAccount', () => {
    beforeEach(() => {
      mockReq = {
        ...mockReq,
        user: {
          userId: 'test-user-id',
          tenantId: 'test-tenant-id',
        },
      }
    })

    it('should allow requests within limit', async () => {
      const middleware = rateLimitByUserAccount(2, 5)
      await middleware(mockReq as Request, mockRes as Response, nextFunction)

      const key = 'rate-limit:/test:GET:test-user-id'
      const attempts = await redisClient.get(key)
      const ttl = await redisClient.ttl(key)

      expect(attempts).toBe('1')
      expect(ttl).toBeGreaterThan(0)
      expect(ttl).toBeLessThanOrEqual(300)
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 2)
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 1)
      expect(nextFunction).toHaveBeenCalled()
    })

    it('should block requests over limit', async () => {
      const middleware = rateLimitByUserAccount(2, 5)
      const key = 'rate-limit:/test:GET:test-user-id'

      // Make 3 requests
      await middleware(mockReq as Request, mockRes as Response, nextFunction)
      await middleware(mockReq as Request, mockRes as Response, nextFunction)
      await middleware(mockReq as Request, mockRes as Response, nextFunction)

      const attempts = await redisClient.get(key)
      expect(attempts).toBe('3')
      expect(mockRes.status).toHaveBeenCalledWith(429)
      expect(mockRes.send).toHaveBeenCalledWith({ error: 'RateLimitReached' })
      expect(nextFunction).toHaveBeenCalledTimes(2)
    })
  })
})
