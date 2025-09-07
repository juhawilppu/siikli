import { z } from 'zod'
import { isValidIsoDate } from '../..'

export interface GetInvoiceResponse {
  total: string
}

export interface GetInvoices {
  invoiceId: number
  customerId: string
  createdAt: string
  total: string
}

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
  invoiceId: number
  customerId: string
  createdAt: string
  total: number
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
