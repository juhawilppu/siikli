import { format } from "date-fns";
import { fi } from "date-fns/locale";

export const dateToString = (date: Date) => format(date, "yyyy-MM-dd", { locale: fi })