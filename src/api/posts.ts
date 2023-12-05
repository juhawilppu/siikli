import { PrismaClient } from '@prisma/client'
import express from 'express'
import { rateLimit } from '../../middlewares/rateLimit'

export const postsRoute = express.Router()
const prisma = new PrismaClient()

postsRoute.get(`/api/posts`, async (req, res) => {
  const result = await prisma.post.findMany({})
  res.json(result)
})

postsRoute.post(`/api/posts`, rateLimit(5, 5), async (req, res) => {
  const { title, content } = req.body
  const result = await prisma.post.create({
    data: {
      title,
      content,
    },
  })
  res.json(result)
})
