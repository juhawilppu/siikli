export interface ProductOrderDto {
  id: string
  productId: string
  price: number
  amount: number
  packages: number
  packageSize: number
  packageType: string
  freetext: string
}

export interface ProductOrderIdDto {
  id: string | null
  productId: string
  price: number
  amount: number
  packageSize: number
  packageType: string
  freetext: string
}

export interface PostOrderDto {
  deliveryDate: string
  customerId: string
  hasNote: boolean
  noteBody: string | null
  noteHeader: string | null
  items: ProductOrderDto[]
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
  company_name: string | null;
  order_index: number | null;
  city: string | null;
  show_price_without_tax: boolean | null;
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

export interface Invoice {
  customer: Customer;
  orders: (Order & { products: OrderProduct[] })[];
  total: number;
}

export interface WarehouseReportRow {
  customer_id: string;
  product_variety: string;
  product_type: string;
  product_name: string;
  package_size: number;
  package_type: string;
  amount: number;
}

export interface GetCompanySettings {
  id: string;
  name: string;
  businessId: string;
  streetAddress: string;
  postalCode: string;
  city: string;
  invoiceBankName: string;
  invoiceBankAccount: string;
  invoiceReference: string;
  invoiceSumRow: string;
  phone: string;
  email: string;
  website: string;
}

export interface CustomerDto {
  id: string
  chain: string
  name: string
  streetAddress: string | null
  postalCode: string | null
  city: string | null
}