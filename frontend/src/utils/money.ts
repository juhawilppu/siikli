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
 * In Finland, numbers are formatted with a comma as the decimal separator (2,55) with 2 decimals.
 * Since the user can write the number in different ways, we need to flexible in parsing the number.
 *
 * @param amount - The number to format, like
 * - "2.55" -> 2,55
 * - 2.5 -> 2,50
 * - 2 -> 2,00
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

/**
 * Parse a Siikli internal formatted monetary string to a number for HTML input element.
 *
* @param amount - The number to parse, like "2,55" or "2.55"
 * @returns The parsed number, like 2.55
 */
export function parseToNumber(amount?: string): string | number {
  if (!amount) {
    return '' // Empty value should be an empty string, not null
  }
  return parseDecimal(amount).toNumber()
}

export function formatPercentage(amount: number) {
  return `${amount
    .toFixed(2)
    .replace('.', ',')
  } %`
}
