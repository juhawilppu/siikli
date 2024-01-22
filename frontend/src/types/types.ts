export interface ProductOrderDto {
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

export interface GetOrderList {
  id: number
  deliveryDate: string
  customer: {
    id: number
    chain: string
    name: string
  }
}
