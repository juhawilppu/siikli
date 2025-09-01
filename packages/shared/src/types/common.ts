import { z } from 'zod'

// All endpoints with /:id/ as URL paramater
export const IdParams = z.object({
  id: z.uuid(),
}).strict()

// POST /api/orders/:id
export interface IdAsBodyDto {
  id: string
}

export interface GetDownloadUrlResponse {
  url: string
}
