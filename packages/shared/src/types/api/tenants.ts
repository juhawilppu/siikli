import { z } from 'zod'

export interface GetOnboardingResponse {
  productCreated: boolean
  customerCreated: boolean
  orderCreated: boolean
  invoiceCreated: boolean
  waybillCreated: boolean
  bankInformationSet: boolean
}

export interface GetCompanySettingsResponse {
  id: string
  name: string
  businessId: string | null
  streetAddress: string | null
  postalCode: string | null
  city: string | null
  invoiceBankName: string | null
  invoiceBankAccount: string | null
  invoiceSumRow: string
  phone: string | null
  email: string | null
  website: string | null
  subscriptionType: string
  subscriptionEndDate: string | null
  subscriptionStartDate: string | null
  trialEndDate: string | null
}

export interface GetUsersResponse {
  id: string
  email: string
  role: 'OWNER' | 'USER'
  lastLoginAt: string | null
}

export const PostCompanySettingsRequest = z.object({
  name: z.string(),
  businessId: z.string().nullable(),
  streetAddress: z.string().nullable(),
  postalCode: z.string().nullable(),
  city: z.string().nullable(),
  invoiceBankName: z.string().nullable(),
  invoiceBankAccount: z.string().nullable(),
  invoiceSumRow: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  website: z.string().nullable(),
}).strict()

export interface GetPackageSettingsResponse {
  packageTypes: string[]
  packageSizes: number[]
}

export const PostAddUserRequest = z.object({
  email: z.string(),
  role: z.enum(['OWNER', 'USER']),
}).strict()

export const PutChangeUserRoleRequest = z.object({
  role: z.enum(['OWNER', 'USER']),
}).strict()

export const PostCompleteSignupRequest = z.object({
  name: z.string(),
  user: z.object({
    marketingConsent: z.boolean(),
  }),
}).strict()

export const PostSubscriptionChangeRequest = z.object({
  subscription: z.enum(['FREE', 'PREMIUM']),
}).strict()

export interface PostSubscriptionChangeResponse {
  subscriptionType: string
  subscriptionEndDate: string | null
  subscriptionStartDate: string | null
  trialEndDate: string | null
}
