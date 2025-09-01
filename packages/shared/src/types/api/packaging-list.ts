import type Decimal from 'decimal.js'
import { z } from 'zod'
import { isValidIsoDate } from '../..'

export const GetPackagingListQuery = z.object({
  deliveryDate: z.string().refine(isValidIsoDate, {
    message: 'Invalid date format for deliveryDate',
  }),
}).strict()

export interface GetPackagingListGroupedByCustomerResponse {
  deliveryDate: string
  groupedBy: 'customer'
  rows: {
    customerId: string
    customerName: string
    productName: string
    packageSize: number
    packageType: string
    freetext: string
    amount: Decimal
  }[]
}

export interface GetPackagingListGroupedByProductResponse {
  deliveryDate: string
  groupedBy: 'product'
  rows: {
    productId: string
    productName: string
    packageSize: number
    packageType: string
    amount: Decimal
  }[]
}
