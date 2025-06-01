import Decimal from 'decimal.js'

export type InvoiceRow = {
  usePrice0: true
  deliveryDate: Date
  orderNumber: number
  productName: string
  quantity: Decimal
  priceWithTax: undefined
  priceWithoutTax: Decimal
  totalWithTax: Decimal
  totalWithoutTax: Decimal
  tax: Decimal
} |
{
  usePrice0: false
  deliveryDate: Date
  orderNumber: number
  productName: string
  quantity: Decimal
  priceWithTax: Decimal
  priceWithoutTax: undefined
  totalWithTax: Decimal
  totalWithoutTax: Decimal
  tax: Decimal
}

export interface InvoiceItemDto {
  id: string
  orderId: string
  orderNumber: number
  deliveryDate: Date
  productName: string
  amount: Decimal
  price: Decimal
  price0: Decimal
}

export interface InvoiceDto {
  invoiceId: number
  date: string
  dueDate: string
  customer: {
    streetAddress: string | null
    postalCode: string | null
    city: string | null
    name: string
    legalName: string | null
    businessId: string | null
    showPriceWithoutTax: boolean
  }
  company: {
    name: string
  }
  paymentCondition: string
  interestRate: number
  notificationPeriod: string
  items: InvoiceRow[]
  totals: {
    totalSumWithTax: Decimal
    finalSumWithTax: Decimal
    totalSumWithoutTax: Decimal
    finalSumWithoutTax: Decimal
    totalTax: Decimal
    totalKg: Decimal
  }
}

export function calculateTotals(items: InvoiceItemDto[], discount: Decimal, usePrice0: boolean) {
  let totalSumWithoutTax = new Decimal(0)
  let totalSumWithTax = new Decimal(0)
  let totalDiscount = new Decimal(0)
  let totalTax = new Decimal(0)
  let finalSumWithoutTax = new Decimal(0)
  let finalSumWithTax = new Decimal(0)
  let totalKg = new Decimal(0)

  const invoiceRows: InvoiceRow[] = []

  for (const item of items) {
    if (usePrice0) {

      // Calculation will be based on VAT 0 % price
      const priceWithTax = undefined
      const priceWithoutTax = new Decimal(item.price0).toDecimalPlaces(2, Decimal.ROUND_HALF_UP)

      const totalWithoutTax = new Decimal(item.amount).mul(priceWithoutTax).toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
      const totalWithTax = totalWithoutTax.mul(1.14).toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
      const tax = (totalWithTax.sub(totalWithoutTax)).toDecimalPlaces(2, Decimal.ROUND_HALF_UP)

      invoiceRows.push({
        usePrice0,
        deliveryDate: item.deliveryDate,
        orderNumber: item.orderNumber,
        productName: item.productName,
        quantity: item.amount,
        priceWithTax,
        priceWithoutTax,
        totalWithTax,
        totalWithoutTax,
        tax,
      })
    }
    else {
      // Calculation will be based on VAT 14 % price
      const priceWithTax = new Decimal(item.price).toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
      const priceWithoutTax = undefined

      const totalWithTax = new Decimal(item.amount).mul(priceWithTax).toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
      const totalWithoutTax = totalWithTax.div(1.14)
      const tax = (totalWithTax.sub(totalWithoutTax)).toDecimalPlaces(2, Decimal.ROUND_HALF_UP)

      invoiceRows.push({
        usePrice0,
        deliveryDate: item.deliveryDate,
        orderNumber: item.orderNumber,
        productName: item.productName,
        quantity: item.amount,
        priceWithTax,
        priceWithoutTax,
        totalWithTax,
        totalWithoutTax,
        tax,
      })
    }
  }

  for (const invoiceRow of invoiceRows) {
    totalSumWithoutTax = totalSumWithoutTax.add(invoiceRow.totalWithoutTax)
    totalSumWithTax = totalSumWithTax.add(invoiceRow.totalWithTax)
    totalKg = totalKg.add(invoiceRow.quantity)
  }

  totalSumWithTax = totalSumWithTax.toDecimalPlaces(2, Decimal.ROUND_HALF_UP)

  totalSumWithoutTax = totalSumWithTax
    .div(1.14)
    .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)

  totalDiscount = totalSumWithoutTax
    .mul(new Decimal(discount).div(100))
    .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)

  finalSumWithoutTax = totalSumWithoutTax.sub(totalDiscount)

  totalTax = finalSumWithoutTax
    .mul(0.14)
    .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)

  finalSumWithTax = finalSumWithoutTax.add(totalTax)

  return {
    items: invoiceRows,
    totals: {
      totalSumWithoutTax: totalSumWithoutTax,
      totalSumWithTax: totalSumWithTax,
      totalDiscount: totalDiscount,
      totalTax: totalTax,
      finalSumWithoutTax: finalSumWithoutTax,
      finalSumWithTax: finalSumWithTax,
      totalKg,
    },
  }
}