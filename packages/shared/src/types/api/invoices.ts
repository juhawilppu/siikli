import { z } from 'zod'
import { isValidIsoDate } from '../..'

export const GetInvoicesQuery = z.object({
  startDate: z.string().refine(isValidIsoDate, {
    message: 'Invalid date format for startDate',
  }),
  endDate: z.string().refine(isValidIsoDate, {
    message: 'Invalid date format for endDate',
  }),
  customerId: z.uuid().optional(),
}).strict()

export interface GetInvoicesResponse {
  id: string
  invoiceId: number
  customerId: string
  customerName: string
  createdAt: string
  total: string
  status: 'PENDING' | 'PAID'
}

export const PostCreateInvoiceRequest = z.object({
  customerId: z.uuid(),
  startDate: z.string().refine(isValidIsoDate, {
    message: 'Invalid date format for startDate',
  }),
  endDate: z.string().refine(isValidIsoDate, {
    message: 'Invalid date format for endDate',
  }),
  preview: z.boolean().optional(),
}).strict()
