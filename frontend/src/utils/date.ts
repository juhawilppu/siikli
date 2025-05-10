import { format } from 'date-fns'
import { fromZonedTime, toZonedTime } from 'date-fns-tz'
import { fi } from 'date-fns/locale'

const TIMEZONE = 'Europe/Helsinki'

export const dateToString = (date: Date) => {
    const helsinkiDate = toZonedTime(date, TIMEZONE)
    return format(helsinkiDate, 'yyyy-MM-dd', { locale: fi })
}

export const stringToDate = (str: string) => {
    // Interpret 'str' as a date string in Helsinki time zone
    return fromZonedTime(`${str}T12:00:00`, TIMEZONE)
}

export const formatDate = (date: Date) => format(date, "d.M.yyyy", { locale: fi })