import { PrismaClient } from '@prisma/client'
import express from 'express'
import cors from 'cors'
import { rateLimit } from './rateLimit'

const prisma = new PrismaClient()
const app = express()


app.use(express.json())
app.use(cors())

app.get(`/posts`, async (req, res) => {
  const result = await prisma.post.findMany({})
  res.json(result)
})

app.post(`/posts`, async (req, res) => {

  const rate = await rateLimit('posts', req, 5, 5)
  res.setHeader('X-RateLimit-Limit', rate.limit)
  res.setHeader('X-RateLimit-Remaining', rate.remaining)

  if (!rate.success) {
    return res.status(429).send({message:'rate_limit_reached'})
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

const server = app.listen(3000, () =>
  console.log(`
🚀 Server ready at: http://localhost:3000
⭐️ See sample requests: http://pris.ly/e/ts/rest-express#3-using-the-rest-api`),
)