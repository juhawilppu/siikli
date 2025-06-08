import Decimal from 'decimal.js'

export function parseDecimal(number: string) {
  try {
    return new Decimal(number.replace(',', '.'))
  }
  catch (error) {
    console.warn('Error parsing decimal', error)
    return new Decimal(0)
  }
}

/**
 * In REST Dto, we use a dot as the decimal separator.
 * @param number - The number to serialize, like "2,55"
 * @returns The serialized number, like "2.55"
 */
export function serializeNumber(number: string) {
  if (number.includes('.')) {
    throw new Error('Number already contains dot')
  }
  return number.replace(',', '.')
}

/**
 * In Finland, numbers are formatted with a comma as the decimal separator.
 * @param amount - The number to format, like "2.55" (string, serialized number) or 2.5 (Decimal, number)
 * @returns The formatted number, like "2,55"
 */

export function formatNumber(amount?: Decimal | number | string) {
  if (!amount) {
    return ''
  }

  if (amount instanceof Decimal) {
    return amount.toNumber().toFixed(2).replace('.', ',')
  }

  if (typeof amount === 'string') {
    return parseDecimal(amount).toFixed(2).replace('.', ',')
  }

  return `${amount
    .toFixed(2)
    .replace('.', ',')}`
}

export function formatMoneyFi(amount: number | string | Decimal) {
  if (typeof amount === 'string') {
    return `${Number.parseFloat(amount).toFixed(2).replace('.', ',')} €`
  }
  if (amount instanceof Decimal) {
    return `${amount.toDecimalPlaces(2).toString().replace('.', ',')} €`
  }
  return `${amount
    .toFixed(2)
    .replace('.', ',')} €`
}

export function formatPercentage(amount: number) {
  return `${amount
    .toFixed(2)
    .replace('.', ',')
  } %`
}
