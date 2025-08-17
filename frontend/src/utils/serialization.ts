export function serializeNumber(number: string) {
  if (number.includes('.')) {
    throw new Error('Number already contains dot')
  }
  return number.replace(',', '.')
}
