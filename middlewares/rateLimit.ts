import { NextFunction, Request, Response } from 'express'
import prisma from '../src/prisma'

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

      if (!req.ip) {
        return res.status(400).send({ error: 'ip_not_found' })
      }

      const key = `rate-limit|${req.url}|${req.method}|${req.ip}`
      const attemptsSoFar = await prisma.rateLimit.count({
        where: {
          key: key,
          ip: req.ip,
          createdAt: {
            gte: new Date(Date.now() - durationInMinutes * 60 * 1000),
          },
        },
      });

      const remainingBeforeThisRequest = limit - attemptsSoFar
      const remainingAfterThisRequest = Math.max(
        remainingBeforeThisRequest - 1,
        0
      )

      res.setHeader('X-RateLimit-Limit', limit)
      res.setHeader('X-RateLimit-Remaining', remainingAfterThisRequest)

      if (remainingBeforeThisRequest === 0) {
        return res.status(429).send({ error: 'rate_limit_reached' })
      }

      await prisma.rateLimit.create({
        data: {
          ip: req.ip,
          key: key
        }
      })
      next()
    }
