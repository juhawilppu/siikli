import express from 'express'
import { rateLimitByIp } from '../middlewares/rate-limit'

export const healthRoute = express.Router()

healthRoute.get(
  '/api/health',
  rateLimitByIp(60, 1),
  (req, res) => {
    res.status(200).json({ message: 'OK', version: process.env.VERSION })
  },
)
