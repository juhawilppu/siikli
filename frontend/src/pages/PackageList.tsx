import { Button } from "@/components/ui/button"
import { Calendar, Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { WarehouseReportRow } from '@/types/types'
import { dateToString, formatDate } from '@/utils/date'
import axios from 'axios'
import { fi } from "date-fns/locale"
import { useState } from 'react'
import { WarehouseReportByCustomer } from './WarehouseReportByCustomer'

const now = new Date()

export const PackageList = () => {
    const [date, setDate] = useState<Date>(now)

    const [report, setReport] = useState<WarehouseReportRow[]>()

    const fetchData = async () => {
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
            </div>
            <Button onClick={fetchData}>Hae tiedot</Button>
            {report && <WarehouseReportByCustomer
                reportDate={date} reportData={report} getSum={() => 0} />}
        </>
    )
}
