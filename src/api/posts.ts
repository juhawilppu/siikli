import { PrismaClient } from '@prisma/client'
import express from 'express'

export const postsRoute = express.Router()
const prisma = new PrismaClient()

/*
postsRoute.get(`/api/posts`, async (req, res) => {
  const result = await prisma.post.findMany({})
  res.json(result)
})

const PostPostsSchema = z.object({
  body: z.object({
    title: z
      .string({
        required_error: 'Title is required',
      })
      .max(128, { message: 'Title has max length 128' }),
    content: z
      .string({
        required_error: 'Content is required',
      })
      .max(512, { message: 'Content has max length 512' }),
  }),
})
type PostPostsRequestDto = z.infer<typeof PostPostsSchema>
interface PostPostsRequest extends Omit<Request, 'body'>, PostPostsRequestDto {}
postsRoute.post(
  `/api/posts`,
  rateLimit(5, 5),
  validate(PostPostsSchema),
  async (req: PostPostsRequest, res: Response) => {
    const { title, content } = req.body
    const result = await prisma.post.create({
      data: {
        title,
        content,
      },
    })
    res.json(result)
  }
)
*/
