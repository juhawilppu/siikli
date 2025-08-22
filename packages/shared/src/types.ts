import type Decimal from 'decimal.js'

export enum OrderStatus {
  WAITING_FOR_DELIVERY = 'WAITING_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  INVOICED = 'INVOICED',
}

export type GetCurrentUserDto = {
  authenticated: false
} | {
  authenticated: true
  userId: string
  email: string
  tenantId: string
  initials: string
  role: 'USER' | 'OWNER'
  signupCompleted: boolean
}

export interface GetOrderRowDto {
  id: string
  productId: string
  price: string
  amount: string
  packages: number
  packageSize: number
  packageType: string
  freetext: string
  createdAt: Date
}

export interface PostOrderItemRequestDto {
  id: string | undefined
  deleted?: boolean
  productId: string
  price: string
  amount: string
  packages: number
  packageSize: number
  packageType: string
  freetext: string
}

export interface PostOrderItemRequest {
  id: string | undefined
  deleted?: boolean
  productId: string
  price: Decimal
  amount: Decimal
  packages: number
  packageSize: number
  packageType: string
  freetext: string
}

export interface PostOrderRequestDto {
  deliveryDate: string
  customerId: string
  hasNote: boolean
  noteBody: string | null
  noteHeader: string | null
  status: OrderStatus
  items: PostOrderItemRequestDto[]
}

export interface PostOrderResponseDto {
  id: string
}

export interface GetOrderDto {
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
  items: GetOrderRowDto[]
}

export interface GetOrderListDto {
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

export interface Customer {
  id: string
  chain: string
  name: string
  business_id: string | null
  postal_code: string | null
  address: string | null
  compensation: number
  reference: string | null
  companyName: string | null
  orderIndex: number | null
  city: string | null
}

export interface Order {
  customerId: string
  deliveryDate: Date
  hasNote: boolean
  id: string
  noteBody: string | null
  noteHeader: string | null
  rows: OrderRow[]
  tenantId: string
}

export interface OrderRow {
  id: string
  orderId: string
  productId: string
  amount: number
  price: string
  packageSize: number
  packageType: string | null
  freetext: string | null
}

export interface PackagingListGroupedByCustomer {
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

export interface PackagingListGroupedByProduct {
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

export interface GetCompanySettings {
  id: string
  name: string
  businessId: string | null
  streetAddress: string | null
  postalCode: string | null
  city: string | null
  invoiceBankName: string | null
  invoiceBankAccount: string | null
  invoiceReference: string | null
  invoiceSumRow: string
  phone: string | null
  email: string | null
  website: string | null
  subscriptionType: string
  subscriptionEndDate: string | null
  subscriptionStartDate: string | null
  trialEndDate: string | null
}

export interface GetUsersResponseDto {
  id: string
  email: string
  role: 'OWNER' | 'USER'
  lastLoginAt: string | null
}

export interface GetCustomersResponse {
  customers: GetCustomerRequest[]
}

export interface GetCustomerRequest {
  id: string
  name: string
  companyLegalName: string | null
  discount: Decimal
  invoiceReference: string | null
  streetAddress: string | null
  postalCode: string | null
  city: string | null
  email: string | null
  phone: string | null
  businessId: string | null
}

export interface GetCustomersResponseDto {
  customers: GetCustomerRequestDto[]
}

export interface GetCustomerRequestDto {
  id: string
  name: string
  companyLegalName: string | null
  discount: string
  invoiceReference: string | null
  streetAddress: string | null
  postalCode: string | null
  city: string | null
  email: string | null
  phone: string | null
  businessId: string | null
}

export interface DeleteCustomerResponseDto {
  deletedOrders: number
  deletedCustomer: string
}

export interface PostCreateCustomerRequestDto {
  name: string
  companyLegalName: string | null
  discount: number | null
  invoiceReference: string | null
  streetAddress: string | null
  postalCode: string | null
  city: string | null
  email: string | null
  phone: string | null
  businessId: string | null
}

export interface PutUpdateCustomerRequestDto {
  name: string
  companyLegalName: string | null
  discount: number
  invoiceReference: string | null
  streetAddress: string | null
  postalCode: string | null
  city: string | null
  email: string | null
  phone: string | null
  businessId: string | null
}

export interface PutUpdateCustomerResponseDto {
  id: string
}

export interface InvoiceRowDto {
  deliveryDate: Date
  orderNumber: number
  productName: string
  quantity: number
  priceWithTax: number
  priceWithoutTax: number
  totalWithTax: number
  totalWithoutTax: number
  tax: number
}

export interface GetInvoiceResponseDto {
  total: string
}

export interface MetricDto {
  value: number
  change: number | null
  unit: 'money' | 'count'
}

export interface GetProductResponse {
  id: string
  name: string
  price: Decimal | null
  packageSize: number | null
  packageType: string | null
}

export interface GetProductResponseDto {
  id: string
  name: string
  price?: string
  packageSize: number | null
  packageType: string | null
}

export interface PostProductCreateRequestDto {
  name: string
  price?: string
  packageSize?: number
  packageType?: string
}

export interface CreateTenantDto {
  name: string
  user: {
    marketingConsent: boolean
  }
}

export interface PostCompanySettings {
  name: string
  businessId: string | null
  streetAddress: string | null
  postalCode: string | null
  city: string | null
  invoiceBankName: string | null
  invoiceBankAccount: string | null
  invoiceReference: string | null
  invoiceSumRow: string | null
  phone: string | null
  email: string | null
  website: string | null
}

export interface GetPackageSettings {
  packageTypes: string[]
  packageSizes: number[]
}

export interface PostSubscriptionChangeRequest {
  subscriptionType: string
  subscriptionEndDate: string | null
  subscriptionStartDate: string | null
  trialEndDate: string | null
}
