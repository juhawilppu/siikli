import { Button } from "@/components/ui/button"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { formatDate } from "@/utils/date"
import { endOfWeek, startOfWeek } from 'date-fns'
import { fi } from "date-fns/locale"
import { Calendar, RefreshCw } from "lucide-react"
import { useState } from 'react'

const now = new Date()

export const SalesReport = () => {
    const [startDate, setStartDate] = useState<Date | undefined>(
        startOfWeek(now, { weekStartsOn: 1 })
    )
    const [endDate, setEndDate] = useState<Date | undefined>(
        endOfWeek(now, { weekStartsOn: 1 })
    )

    const getReport = async () => {
        const res = await fetch('/api/sales-report');
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'order-products.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
    };


    return (
        <>
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Myyntiraportti</h1>
                <p className="text-muted-foreground">Tällä sivulla voit tulostaa koko myyntikannan Exceliin.</p>
            </div>
            <div className="space-y-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Hakuehdot</CardTitle>
                        <CardDescription>Suodata tilauksia päivämäärän mukaan</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Alkupäivä</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                                            <Calendar className="mr-2 h-4 w-4" />
                                            {startDate ? formatDate(startDate) : <span>Select date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <CalendarComponent
                                            mode="single"
                                            selected={startDate}
                                            onSelect={setStartDate}
                                            required
                                            initialFocus
                                            locale={fi}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Loppupäivä</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                                            <Calendar className="mr-2 h-4 w-4" />
                                            {endDate ? formatDate(endDate) : <span>Select date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <CalendarComponent mode="single" selected={endDate} onSelect={setEndDate} required locale={fi} />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="flex justify-end items-end gap-2">
                                <Button onClick={getReport}><RefreshCw className="w-4 h-4 mr-2" /> Hae tiedot</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
