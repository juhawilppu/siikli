import express from 'express'
import { BadRequestError, ForbiddenError, InternalServerError, UnauthenticatedError } from '../middlewares/error-handler'
import { rateLimitByIp } from '../middlewares/rate-limit'

// Routes for testing error handling
export const exceptionsRoute = express.Router()

exceptionsRoute.get(
  '/api/testing/exception/400',
  rateLimitByIp(10, 1),
  (_req, _res) => {
    throw new BadRequestError('Test throwing BadRequestError')
  },
)

exceptionsRoute.get(
  '/api/testing/exception/401',
  rateLimitByIp(10, 1),
  (_req, _res) => {
    throw new UnauthenticatedError('Test throwing UnauthenticatedError')
  },
)

exceptionsRoute.get(
  '/api/testing/exception/403',
  rateLimitByIp(10, 1),
  (_req, _res) => {
    throw new ForbiddenError('Test throwing ForbiddenError')
  },
)

exceptionsRoute.get(
  '/api/testing/exception/429',
  rateLimitByIp(0, 1),
  (_req, res) => {
    return res.status(200).send({ message: 'Since the rateLimit is 0, you will never get see this message' })
  },
)

exceptionsRoute.get(
  '/api/testing/exception/500',
  rateLimitByIp(10, 1),
  (_req, _res) => {
    throw new InternalServerError('Test throwing InternalServerError')
  },
)
