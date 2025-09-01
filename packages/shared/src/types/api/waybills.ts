import z from 'zod'
import { isValidIsoDate } from '../../date'

// POST /api/orders/waybills
export const CreateWaybillsRequest = z.object({
  startDate: z.string().refine(isValidIsoDate, {
    message: 'Invalid date format for startDate',
  }),
  endDate: z.string().refine(isValidIsoDate, {
    message: 'Invalid date format for endDate',
  }),
  customerId: z.string().optional(),
  preview: z.boolean(),
}).strict()
