import type Decimal from 'decimal.js'
import { z } from 'zod'

export interface GetProductResponse {
  id: string
  name: string
  price: Decimal | null
  packageSize: number | null
  packageType: string | null
}

export interface GetProductsResponse {
  id: string
  name: string
  price?: string
  packageSize: number | null
  packageType: string | null
}

export const PostCreateProductRequest = z.object({
  name: z.string(),
  price: z.string().optional(),
  packageSize: z.number().optional(),
  packageType: z.string().optional(),
}).strict()
