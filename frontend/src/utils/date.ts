import { format } from 'date-fns'
import { fi } from 'date-fns/locale'

/**
 * Converts a Date object to a string in the format 'yyyy-MM-dd', using local timezone.
 * @param date The Date object to convert.
 * @returns The formatted date string.
 */
export function dateToIso(date: Date) {
  return format(date, 'yyyy-MM-dd', { locale: fi })
}

/**
 * Converts a date string in the format 'yyyy-MM-dd' to a Date object.
 * @param input A date string in the format 'yyyy-MM-dd'.
 * Parses the input string and returns a Date object.
 * This is useful for converting date strings from APIs or user input into Date objects.
 * @returns The parsed Date object.
 */
export function parseIsoDate(input: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    throw new Error(`Invalid date format: ${input}`)
  }
  const [year, month, day] = input.split('-').map(Number)
  if (month < 1 || month > 12) {
    throw new Error(`Invalid month: ${month}`)
  }
  if (day < 1 || day > 31) {
    throw new Error(`Invalid day: ${day}`)
  }
  return new Date(Date.UTC(year, month - 1, day))
}

/**
 *
 * @param date The Date object to format.
 * Formats the date to 'd.M.yyyy' format using Finnish locale.
 * This is useful for displaying dates in a user-friendly format.
 * @returns The formatted date string.
 */
export const formatDate = (date: Date) => format(date, 'd.M.yyyy', { locale: fi })
