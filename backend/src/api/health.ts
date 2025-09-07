import express from 'express'
import { rateLimitByIp } from '../middlewares/rate-limit'

export const healthRoute = express.Router()

healthRoute.get(
  '/api/health',
  rateLimitByIp(60, 1),
  (req, res) => {
    res.status(200).json({ message: 'OK', node: 22, version: process.env.VERSION })
  },
)

healthRoute.get(
  '/api/exception',
  rateLimitByIp(10, 1),
  () => {
    throw new Error('test')
  },
)
