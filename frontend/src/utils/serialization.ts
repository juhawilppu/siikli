/**
 * Serializes a number to a string with a dot as the decimal separator.
 * @param number - The number to serialize, like "1 200,23"
 * @returns The serialized number, like "1200.23".
 */
export function serializeNumber(number: string) {
  if (number.includes('.')) {
    throw new Error('Number already contains dot')
  }
  return number
    .replace(/ /g, '') // Remove spaces
    .replace(',', '.')
}
