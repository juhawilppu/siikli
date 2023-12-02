import { Prisma, PrismaClient } from '@prisma/client'
import express from 'express'
import cors from 'cors'

const prisma = new PrismaClient()
const app = express()

app.use(express.json())
app.use(cors())

app.get(`/users`, async (req, res) => {
  const result = await prisma.user.findMany({})
  res.json(result)
})

app.post(`/users`, async (req, res) => {
  const { email, name } = req.body
  const result = await prisma.user.create({
    data: {
      email,
      name
    },
  })
  res.json(result)
})

const server = app.listen(3000, () =>
  console.log(`
🚀 Server ready at: http://localhost:3000
⭐️ See sample requests: http://pris.ly/e/ts/rest-express#3-using-the-rest-api`),
)