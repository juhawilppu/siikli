import type { NextFunction, Request, Response } from 'express'
import redisClient from '../redis'
import { BadRequestError } from './error-handler'
import { getSessionOrThrow } from './permissions'

/***
 * Rate-limiting middleware based on client IP address. Rate-limiting is done per endpoint (method, url).
 *
 * @param limit How many attempts is allowed.
 * @param durationInMinutes Time-window for the attempts.
 *
 * For example,
 * rateLimit(2, 5)
 * means that 2 attempts are allowed within 5 minutes.
 */
export function rateLimitByIp(limit: number, durationInMinutes: number) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.ip) {
      throw new BadRequestError('Request had no IP address')
    }

    const key = `rate-limit:${req.url}:${req.method}:${req.ip}`

    const attempts = await redisClient.incr(key)

    // Set expiry on first attempt
    if (attempts === 1) {
      await redisClient.expire(key, durationInMinutes * 60)
    }

    const remaining = Math.max(limit - attempts, 0)

    res.setHeader('X-RateLimit-Limit', limit)
    res.setHeader('X-RateLimit-Remaining', remaining)

    if (attempts > limit) {
      return res.status(429).send({ error: 'RateLimitReached' })
    }

    next()
  }
}

/***
 * Rate-limiting middleware based on client IP address. Rate-limiting is done per endpoint (method, url).
 *
 * @param limit How many attempts is allowed.
 * @param durationInMinutes Time-window for the attempts.
 *
 * For example,
 * rateLimit(2, 5)
 * means that 2 attempts are allowed within 5 minutes.
 */
export function rateLimitByUserAccount(limit: number, durationInMinutes: number) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = getSessionOrThrow(req)

    const key = `rate-limit:${req.url}:${req.method}:${userId}`

    const attempts = await redisClient.incr(key)

    // Set expiry on first attempt
    if (attempts === 1) {
      await redisClient.expire(key, durationInMinutes * 60)
    }

    const remaining = Math.max(limit - attempts, 0)

    res.setHeader('X-RateLimit-Limit', limit)
    res.setHeader('X-RateLimit-Remaining', remaining)

    if (attempts > limit) {
      return res.status(429).send({ error: 'RateLimitReached' })
    }

    next()
  }
}
