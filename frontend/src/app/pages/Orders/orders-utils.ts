import type { OrderItem } from './OrderForm'
import { parseDecimal } from '@siikli/shared'
import Decimal from 'decimal.js'

export function calculateTotal(orderItems: OrderItem[]): Decimal {
  const total = orderItems
    .filter(item => !item.deleted)
    .reduce((sum, item) => {
      const amount = item.amount === '' || item.amount == null ? '0' : String(item.amount)
      const price = item.price === '' || item.price == null ? '0' : String(item.price)
      return sum.plus(parseDecimal(amount).mul(parseDecimal(price)))
    }, new Decimal(0))
  return total.toDecimalPlaces(2)
}
