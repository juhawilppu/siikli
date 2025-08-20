import { Prisma } from '@prisma/client'
import { parseDecimal } from '@siikli/shared'
import Decimal from 'decimal.js'

/**
 * In REST Dto, we use a dot as the decimal separator.
 * @param number - The number to serialize, like "2,55"
 * @returns The serialized number, like "2.55"
 */
export function serializeNumber(number: string | Prisma.Decimal | Decimal): string {
  if (number instanceof Prisma.Decimal) {
    return number.toDecimalPlaces(2).toString()
  }
  if (number instanceof Decimal) {
    return number.toDecimalPlaces(2).toString()
  }
  if (typeof number === 'string') {
    return parseDecimal(number).toDecimalPlaces(2).toString()
  }
  throw new Error(`Invalid type: ${typeof number}`)
}
