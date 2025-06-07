import Decimal from 'decimal.js'

export function formatNumber(amount?: Decimal | number | string) {
  if (!amount) {
    return ''
  }

  if (amount instanceof Decimal) {
    return amount.toNumber().toFixed(2).replace('.', ',')
  }

  // TODO: As a long-term plan, this function should never receive numbers or strings that don't have 2 decimals.

  if (typeof amount === 'string') {
    return Number.parseFloat(amount).toFixed(2).replace('.', ',')
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
