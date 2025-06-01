import { Decimal } from "@prisma/client/runtime/library";

export function formatNumber(amount?: Decimal) {
  if (!amount) {
    return ''
  }

  return amount.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toFixed(2).replace('.', ',')
}
