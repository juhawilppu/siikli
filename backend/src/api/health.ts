import express from 'express'

export const healthRoute = express.Router()

healthRoute.get(
  '/api/health',
  (req, res) => {
    res.status(200).json({ message: 'OK', node: 22, version: process.env.VERSION })
  },
)

healthRoute.get(
  '/api/exception',
  () => {
    throw new Error('test')
  },
)
