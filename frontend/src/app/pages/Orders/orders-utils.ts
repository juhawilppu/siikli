import type { OrderItem } from './OrderForm'
import { parseDecimal } from '@siikli/shared'
import Decimal from 'decimal.js'

export function calculateTotal(orderItems: OrderItem[]): Decimal {
  const total = orderItems
    .filter(item => !item.deleted)
    .reduce(
      (sum, item) =>
        sum.plus(
          parseDecimal(String(item.amount ?? '0')).mul(
            parseDecimal(String(item.price ?? '0')),
          ),
        ),
      new Decimal(0),
    )
  return total.toDecimalPlaces(2)
}
