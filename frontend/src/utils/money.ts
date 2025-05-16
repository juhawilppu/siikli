export function formatMoneyFi(amount: number, decimals = 2) {
  return `${amount
    .toFixed(decimals)
    .replace('.', ',')
  } €`
}
export function formatPercentage(amount: number, decimals = 2) {
  return `${amount
    .toFixed(decimals)
    .replace('.', ',')
  } %`
}
