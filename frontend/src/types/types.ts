export interface ProductOrderDto {
  productId: number
  price: number
  amount: number
  packageSize: number
  packageType: string
  freetext: string
}

export interface ProductOrderIdDto {
  id: number | null
  productId: number
  price: number
  amount: number
  packageSize: number
  packageType: string
  freetext: string
}

export interface PostOrderDto {
  deliveryDate: string
  customerId: number
  hasNote: boolean
  noteBody: string
  noteHeader: string
  rows: ProductOrderDto[]
}

export interface PostOrderIdDto {
  deliveryDate: string
  customerId: number
  hasNote: boolean
  noteBody: string
  noteHeader: string
  rows: ProductOrderIdDto[]
}

export interface GetOrderList {
  id: number
  deliveryDate: string
  customer: {
    id: number
    chain: string
    name: string
  }
}

export interface Customer {
  id: number;
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
  customerId: number;
  deliveryDate: Date;
  hasNote: boolean;
  id: number;
  noteBody: string | null;
  noteHeader: string | null;
  products: OrderProduct[]
  showPriceWithoutTax: boolean | null;
  tenantId: number;
}

export interface OrderProduct {
  id: number;
  orderId: number;
  productId: number;
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