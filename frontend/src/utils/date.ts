import { format, parse } from "date-fns";
import { fromZonedTime } from "date-fns-tz";
import { fi } from "date-fns/locale";

export const dateToString = (date: Date) => format(date, "yyyy-MM-dd", { locale: fi })

export const stringToDate = (str: string) => {
    const localDate = parse(str, 'yyyy-MM-dd', new Date())
    return fromZonedTime(localDate, 'Europe/Helsinki')
}

export const formatDate = (date: Date) => format(date, "d.M.yyyy", { locale: fi })