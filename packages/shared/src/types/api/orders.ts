import { z } from 'zod'
import { isValidIsoDate } from '../../date'

export enum OrderStatus {
  WAITING_FOR_DELIVERY = 'WAITING_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  INVOICED = 'INVOICED',
}

// GET /api/orders/limit
export interface GetOrderLimit {
  remaining: number
}

// GET /api/orders
export const GetOrdersQuery = z.object({
  startDate: z.string().refine(isValidIsoDate, {
    message: 'Invalid date format for startDate',
  }),
  endDate: z.string().refine(isValidIsoDate, {
    message: 'Invalid date format for endDate',
  }),
  status: z.enum(OrderStatus).optional(),
  customerId: z.string().optional(),
}).strict()

// GET /api/orders/:id
export interface GetOrderResponse {
  id: string
  orderNumber: number
  invoiceId: string | null
  invoiceNumber: number | null
  status: OrderStatus
  deliveryDate: string
  customerId: string
  hasNote: boolean
  noteBody: string | null
  noteHeader: string | null
  items: {
    id: string
    productId: string
    price: string
    amount: string
    packages: number
    packageSize: number
    packageType: string
    freetext: string
    createdAt: Date
  }[]
}

// GET /api/orders
export interface GetOrdersResponse {
  id: string
  deliveryDate: string
  orderNumber: number
  status: OrderStatus
  customer: {
    id: string
    name: string
  }
  total: string
}

// POST /api/orders
export const PostCreateOrderItemRequest = z.object({
  id: z.uuid().optional(),
  deleted: z.boolean().optional(),
  productId: z.uuid(),
  price: z.string(),
  amount: z.string(),
  packages: z.number(),
  packageSize: z.number(),
  packageType: z.string(),
  freetext: z.string().optional(),
}).strict()

export const PostCreateOrderRequest = z.object({
  deliveryDate: z.string().refine(isValidIsoDate, {
    message: 'Invalid date format for deliveryDate',
  }),
  customerId: z.uuid(),
  hasNote: z.boolean(),
  noteBody: z.string().optional(),
  noteHeader: z.string().optional(),
  status: z.enum(OrderStatus),
  items: z.array(PostCreateOrderItemRequest),
}).strict()
