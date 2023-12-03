import { PrismaClient } from '@prisma/client'
import express from 'express'
import { rateLimit } from '../rateLimit'

export const postsRoute = express.Router()
const prisma = new PrismaClient()

postsRoute.get(`/api/posts`, async (req, res) => {
  const result = await prisma.post.findMany({})
  res.json(result)
})

postsRoute.post(`/api/posts`, async (req, res) => {
  const rate = await rateLimit('posts', req, 5, 5)
  res.setHeader('X-RateLimit-Limit', rate.limit)
  res.setHeader('X-RateLimit-Remaining', rate.remaining)

  if (!rate.success) {
    return res.status(429).send({ message: 'rate_limit_reached' })
  }

  const { title, content } = req.body
  const result = await prisma.post.create({
    data: {
      title,
      content,
    },
  })
  res.json(result)
})
