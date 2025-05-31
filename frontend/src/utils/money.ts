export function formatNumber(amount: number | string, decimals = 2) {
  if (typeof amount === 'string') {
    return parseFloat(amount).toFixed(decimals).replace('.', ',')
  }
  return `${amount
    .toFixed(decimals)
    .replace('.', ',')}`
}

export function formatMoneyFi(amount: number | string, decimals = 2) {
  if (typeof amount === 'string') {
    return parseFloat(amount).toFixed(decimals).replace('.', ',') + ' €'
  }
  return `${amount
    .toFixed(decimals)
    .replace('.', ',')} €`
}

export function formatPercentage(amount: number, decimals = 2) {
  return `${amount
    .toFixed(decimals)
    .replace('.', ',')
  } %`
}
