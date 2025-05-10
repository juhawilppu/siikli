export interface GetCurrentUserDto {
  userId: string
  tenantId: string
  initials: string
  signupCompleted: boolean
}

export interface ProductOrderDto {
  id: string
  productId: string
  price: number | null
  amount: number
  packages: number
  packageSize: number
  packageType: string
  freetext: string
}

export interface PostOrderItemRequestDto {
  id: string | undefined
  deleted?: boolean
  productId: string
  price: number
  amount: number
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
  items: PostOrderItemRequestDto[]
}

export interface PostOrderResponseDto {
  id: string
}

export interface GetOrderDto {
  id: string
  deliveryDate: string
  customerId: string
  hasNote: boolean
  noteBody: string | null
  noteHeader: string | null
  items: ProductOrderDto[]
}

export interface GetOrderList {
  id: string
  deliveryDate: string
  customer: {
    id: string
    chain: string
    name: string
  }
  total: number
}

export interface Customer {
  id: string;
  chain: string;
  name: string;
  business_id: string | null;
  postal_code: string | null;
  address: string | null;
  compensation: number;
  reference: string | null;
  companyName: string | null;
  orderIndex: number | null;
  city: string | null;
  showPriceWithoutTax: boolean | null;
}

export interface Order {
  customerGroup: string | null;
  customerId: string;
  deliveryDate: Date;
  hasNote: boolean;
  id: string;
  noteBody: string | null;
  noteHeader: string | null;
  products: OrderProduct[]
  showPriceWithoutTax: boolean | null;
  tenantId: string;
}

export interface OrderProduct {
  id: string;
  orderId: string;
  productId: string;
  amount: number;
  price: number;
  price0: number;
  packageSize: number;
  packageType: string | null;
  freetext: string | null;
}

export interface WarehouseReportByCustomerRow {

  customerId: string;
  customerName: string;
  productVariety: string;
  productType: string;
  productName: string;
  packageSize: number;
  packageType: string;
  freetext: string
  amount: number;
}

export interface WarehouseReportByCustomer {
  deliveryDate: string
  groupedBy: 'customer'
  rows: WarehouseReportByCustomerRow[]
}

export interface WarehouseReportByProduct {
  deliveryDate: string
  groupedBy: 'product'
  rows: {
    productId: string;
    productVariety: string;
    productType: string;
    productName: string;
    packageSize: number;
    packageType: string;
    amount: number;
  }[]
}

export interface GetCompanySettings {
  id: string;
  name: string;
  businessId: string | null;
  streetAddress: string | null;
  postalCode: string | null;
  city: string | null;
  invoiceBankName: string | null;
  invoiceBankAccount: string | null;
  invoiceReference: string | null;
  invoiceSumRow: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  subscriptionType: string;
  subscriptionEndDate: string | null;
  subscriptionStartDate: string | null;
  trialEndDate: string | null;
}

export interface GetCustomersResponseDto {
  customerGroups: string[]
  customers: CustomerDto[]
  chains: string[]
}

export interface DeleteCustomerResponseDto {
  deletedOrders: number
  deletedCustomer: string
}

export interface CustomerDto {
  id: string
  chain: string
  name: string
  streetAddress: string | null
  streetAddress2: string | null
  postalCode: string | null
  city: string | null
  showPriceWithoutTax: boolean
  compensation: number
  reference: string | null
  companyName: string | null
  orderIndex: number | null
  email: string | null
  phone: string | null
  businessId: string | null
  customerGroup: string | null
}

export interface InvoiceItemDto {
  orderId: string
  orderNumber: number
  deliveryDate: Date
  productName: string
  amount: number
  price: number
  price0: number
}

export interface InvoiceDto {
  invoiceId: number
  date: string
  dueDate: string
  customer: {
    chain: string
    name: string
    companyName: string | null
    businessId: string | null
    address: string | null
    postalCode: string | null
    city: string | null
    showPriceWithoutTax: boolean
  }
  company: {
    name: string
  }
  paymentCondition: string
  interestRate: number
  notificationPeriod: string
  items: InvoiceItemDto[]
  totals: {
    totalSumWithTax: number
    finalSumWithTax: number
    totalSumWithoutTax: number
    finalSumWithoutTax: number
    totalTax: number
    totalKg: number
  }
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

export interface GetProductResponseDto {
  id: string
  orderIndex: number
  chain: string | null
  name: string
  info: string | null
  price: number | null
  price0: number | null
  variety: string | null
  type: string | null
  subtype: string | null
  packageSize: number | null
  packageType: string | null
}

export interface ProductTypeResponse {
  id: string;
  name: string;
  orderIndex: number
  subtypes: {
    id: string;
    name: string;
    orderIndex: number;
  }[];
}

export interface ReorderDto {
  first: {
    id: string
    orderIndex: number
  },
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
  businessId: string
  address1: string
  invoiceBankName: string
  invoiceBankNumber: string
  invoiceReference: string
  invoiceSumRow: string
}

export interface PostSubscriptionChangeRequest {
  subscriptionType: string
  subscriptionEndDate: string | null
  subscriptionStartDate: string | null
  trialEndDate: string | null
}