import { Prisma } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { parseDecimal } from '../../frontend/src/utils/money'

export function formatNumber(amount?: Decimal | null) {
  if (!amount) {
    return ''
  }

  return amount.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toFixed(2).replace('.', ',')
}

export function serializeNumber(number: string | Prisma.Decimal) {
  console.log('serializeNumber', number)
  console.log('typeof', typeof number)
  if (number instanceof Prisma.Decimal) {
    return number.toDecimalPlaces(2).toString()
  }
  if (typeof number === 'string') {
    return parseDecimal(number).toDecimalPlaces(2).toString()
  }
  throw new Error(`Invalid type: ${typeof number}`)
}
