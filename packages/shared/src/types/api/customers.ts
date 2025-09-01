import { z } from 'zod'

export interface GetCustomerResponse {
  id: string
  name: string
  companyLegalName: string | null
  businessId: string | null
  streetAddress: string | null
  postalCode: string | null
  city: string | null
  discount: string
  invoiceReference: string | null
  email: string | null
  phone: string | null
}

export interface GetCustomersResponse {
  customers: GetCustomerResponse[]
}

export interface DeleteCustomerResponse {
  deletedOrders: number
  deletedCustomer: string
}

export const PostCreateCustomerRequest = z.object({
  name: z.string(),
  companyLegalName: z.string().nullable(),
  discount: z.string().nullable(),
  invoiceReference: z.string().nullable(),
  streetAddress: z.string().nullable(),
  postalCode: z.string().nullable(),
  city: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  businessId: z.string().nullable(),
}).strict()

export interface PutUpdateCustomerResponseDto {
  id: string
}
