import { NextFunction, Request, Response } from 'express'
import { createRedisClient } from '../src/redis'

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
export const rateLimit =
  (limit: number, durationInMinutes: number) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const redis = createRedisClient()
    await redis.connect()

    const key = `rate-limit|${req.url}|${req.method}|${req.ip}`
    const attemptsSoFar = parseInt((await redis.get(key)) || '0')
    const remainingBeforeThisRequest = limit - attemptsSoFar
    const remainingAfterThisRequest = Math.max(
      remainingBeforeThisRequest - 1,
      0
    )

    res.setHeader('X-RateLimit-Limit', limit)
    res.setHeader('X-RateLimit-Remaining', remainingAfterThisRequest)

    if (remainingBeforeThisRequest === 0) {
      await redis.disconnect()
      return res.status(429).send({ error: 'rate_limit_reached' })
    }

    await redis.incr(key)
    await redis.expire(key, durationInMinutes * 60)
    await redis.disconnect()
    next()
  }
