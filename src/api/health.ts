import express from 'express'

export const healthRoute = express.Router()

healthRoute.get(
  '/api/health',
  (req, res) => {
    res.status(200).json({ message: 'OK', version: process.env.VERSION })
  },
)
