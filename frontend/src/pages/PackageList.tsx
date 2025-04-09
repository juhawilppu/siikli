import { Button } from "@/components/ui/button"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { WarehouseReportRow } from '@/types/types'
import { dateToString, formatDate } from '@/utils/date'
import axios from 'axios'
import { fi } from "date-fns/locale"
import { Calendar } from "lucide-react"
import { useState } from 'react'
import { WarehouseReportByCustomer } from './WarehouseReportByCustomer'

export const PackageList = () => {
    const [date, setDate] = useState<Date | undefined>(new Date())

    const [report, setReport] = useState<WarehouseReportRow[]>()

    const fetchData = async () => {
        if (!date) {
            return
        }
        const res = await axios.get('/warehouse-report/grouped-by-customer', {
            params: {
                deliveryDate: dateToString(date)
            }
        })
        console.log('report', res.data)
        setReport(res.data)
    }

    return (
        <>
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Pakkauslista</h1>
                <p className="text-muted-foreground">Voit tulostaa pakkauslistan täältä.</p>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Alkupäivä</label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <Calendar className="mr-2 h-4 w-4" />
                            {date ? formatDate(date) : <span>Select date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                            locale={fi}
                        />
                    </PopoverContent>
                </Popover>
                <Button onClick={fetchData}>Hae tiedot</Button>
            </div>
            {report && date && <WarehouseReportByCustomer
                reportDate={date} reportData={report} />}
        </>
    )
}
