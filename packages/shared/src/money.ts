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

function _formatNumber(amount: number) {
  // Format integer part with spaces as thousands separator
  const [intPart, decPart] = amount.toFixed(2).split('.')
  const intWithSpaces = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return `${intWithSpaces},${decPart}`
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
    return _formatNumber(amount.toNumber())
  }

  if (typeof amount === 'string') {
    return _formatNumber(parseDecimal(amount).toNumber())
  }

  return _formatNumber(amount)
}

export function formatPercentage(amount: number) {
  return `${amount
    .toFixed(2)
    .replace('.', ',')
  } %`
}

/**
 * Parse a Siikli internal formatted monetary string to a number for HTML input element.
 *
 * @param amount - The number to parse, like "2,55" or "2.55" or 2.55
 * @returns The parsed number, like 2.55
 */
export function parseToNumber(amount?: string | number): string | number {
  if (!amount) {
    // TODO: Why not null?
    return '' // Empty value should be an empty string, not null.
  }
  return parseDecimal(amount.toString().replace(' ', '').replace(',', '.')).toNumber()
}
