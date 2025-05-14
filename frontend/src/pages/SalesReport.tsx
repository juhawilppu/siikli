import SiikliPage from "@/SiikliPage"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { formatDate } from "@/utils/date"
import { endOfWeek, startOfWeek } from 'date-fns'
import { fi } from "date-fns/locale"
import { Calendar, Download } from "lucide-react"
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
        a.download = 'myyntiraportti.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
    };


    return (
        <SiikliPage title="Myyntiraportti" description="Tällä sivulla voit tulostaa koko myyntikannan Exceliin">
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
                            <Button onClick={getReport}><Download className="w-4 h-4 mr-2" /> Lataa</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </SiikliPage>
    )
}
