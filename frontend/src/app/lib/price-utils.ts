export function calculatePricesFromVat14(price: string, format: boolean) {
  const price0 = Number.parseFloat(price) / 1.14
  return { price: format ? Number.parseFloat(price).toFixed(2) : price, price0: price0.toFixed(2) }
}

export function calculatePricesFromVat0(price0: string, format: boolean) {
  const price = Number.parseFloat(price0) * 1.14
  return { price: price.toFixed(2), price0: format ? Number.parseFloat(price0).toFixed(2) : price0 }
}
