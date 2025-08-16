import type Decimal from 'decimal.js'

export type GetCurrentUserDto = {
  authenticated: false
} | {
  authenticated: true
  userId: string
  tenantId: string
  email: string
  initials: string
  role: 'USER' | 'OWNER'
  signupCompleted: boolean
}

export interface GetOrderRowDto {
  id: string
  productId: string
  price: string
  price0: string
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
  price0: string
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
  price0: Decimal
  amount: Decimal
  packages: number
  packageSize: number
  packageType: string
  freetext: string
}

export interface PostOrderRequestDto {
  status: OrderStatus
  deliveryDate: string
  customerId: string
  hasNote: boolean
  noteBody: string | null
  noteHeader: string | null
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
  deliveryDate: string
  customerId: string
  hasNote: boolean
  noteBody: string | null
  noteHeader: string | null
  items: GetOrderRowDto[]
  status: OrderStatus
}

export interface GetOrderList {
  id: string
  deliveryDate: string
  orderNumber: number
  status: 'WAITING_FOR_DELIVERY' | 'DELIVERED' | 'INVOICED'
  customer: {
    id: string
    name: string
  }
  total: number
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
  showPriceWithoutTax: boolean | null
}

export interface Order {
  customerGroup: string | null
  customerId: string
  deliveryDate: Date
  hasNote: boolean
  id: string
  noteBody: string | null
  noteHeader: string | null
  rows: OrderRow[]
  showPriceWithoutTax: boolean | null
  tenantId: string
}

export interface OrderRow {
  id: string
  orderId: string
  productId: string
  amount: number
  price: number
  price0: number
  packageSize: number
  packageType: string | null
  freetext: string | null
}

export type OrderStatus = 'WAITING_FOR_DELIVERY' | 'DELIVERED' | 'INVOICED'

export interface PackagingListGroupedByCustomer {
  deliveryDate: string
  groupedBy: 'customer'
  rows: {
    customerId: string
    customerName: string
    productVariety: string
    productType: string
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
    productVariety: string
    productType: string
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
  invoiceSumRow: string | null
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
  customerGroups: string[]
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
  showPriceWithoutTax: boolean
  email: string | null
  phone: string | null
  businessId: string | null
  customerGroup: string | null
}

export interface GetCustomersResponseDto {
  customerGroups: string[]
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
  showPriceWithoutTax: boolean
  email: string | null
  phone: string | null
  businessId: string | null
  customerGroup: string | null
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
  showPriceWithoutTax: boolean
  email: string | null
  phone: string | null
  businessId: string | null
  customerGroup: string | null
}

export interface PutUpdateCustomerRequestDto {
  name: string
  companyLegalName: string | null
  discount: number
  invoiceReference: string | null
  streetAddress: string | null
  postalCode: string | null
  city: string | null
  showPriceWithoutTax: boolean
  email: string | null
  phone: string | null
  businessId: string | null
  customerGroup: string | null
}

export interface PutUpdateCustomerResponseDto {
  id: string
}

export type InvoiceRowDto = {
  usePrice0: true
  deliveryDate: Date
  orderNumber: number
  productName: string
  quantity: number
  priceWithTax: undefined
  priceWithoutTax: number
  totalWithTax: number
  totalWithoutTax: number
  tax: number
} | {
  usePrice0: false
  deliveryDate: Date
  orderNumber: number
  productName: string
  quantity: number
  priceWithTax: number
  priceWithoutTax: undefined
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

export interface DashboardDataDto {
  metrics: {
    salesThisYear: MetricDto
    invoicesSent: MetricDto
    ordersToday: MetricDto
    uninvoiced: MetricDto
  }
  orders: {
    orderId: string
    deliveryDate: Date
    customerName: string
    amount: number
  }[]
}

export interface ProductDto {
  id: string
  chain: string
  name: string
  price: number
  packageSize: number
  packageType: string
}

export interface GetProductResponse {
  id: string
  name: string
  info: string | null
  price: Decimal | null
  price0: Decimal | null
  variety: string | null
  type: string | null
  subtype: string | null
  packageSize: number | null
  packageType: string | null
  customerGroup: string | null
}

export interface GetProductResponseDto {
  id: string
  name: string
  info: string | null
  price?: string
  price0?: string
  variety: string | null
  type: string | null
  subtype: string | null
  packageSize: number | null
  packageType: string | null
  customerGroup: string | null
}

export interface PostProductCreateRequestDto {
  name: string
  price?: number
  price0?: number
  type?: string
  subtype?: string
  packageSize?: number
  packageType?: string
  customerGroup?: string
  variety: string
  info: string
}

export interface ProductTypeResponse {
  id: string
  type: string
  orderIndex: number
  subtypes: {
    id: string
    name: string
    orderIndex: number
  }[]
}

export interface ReorderDto {
  first: {
    id: string
    orderIndex: number
  }
  second: {
    id: string
    orderIndex: number
  }
}

export interface CreateTenantDto {
  name: string
  businessId: string
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
  invoiceSwiftBic: string | null
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
