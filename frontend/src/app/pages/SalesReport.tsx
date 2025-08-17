import { formatDate } from '@siikli/shared'
import { endOfWeek, startOfWeek } from 'date-fns'
import { fi } from 'date-fns/locale'
import { Calendar, Download } from 'lucide-react'
import { useState } from 'react'
import SiikliPage from '@/app/components/SiikliPage'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const now = new Date()

export function SalesReport() {
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState<Date | undefined>(
    startOfWeek(now, { weekStartsOn: 1 }),
  )
  const [openStartDate, setOpenStartDate] = useState(false)
  const [endDate, setEndDate] = useState<Date | undefined>(
    endOfWeek(now, { weekStartsOn: 1 }),
  )
  const [openEndDate, setOpenEndDate] = useState(false)

  const getReport = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/sales-report')
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'myyntiraportti.xlsx'
      a.click()
      window.URL.revokeObjectURL(url)
    }
    finally {
      setLoading(false)
    }
  }

  return (
    <SiikliPage title="Myyntiraportti" description="Tällä sivulla voit tulostaa koko myyntikannan Exceliin">
      <Card>
        <CardHeader>
          <CardTitle>Hakuehdot</CardTitle>
          <CardDescription className="text-gray-700">Suodata tilauksia päivämäärän mukaan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 w-full md:flex-row">
            <div className="space-y-2 flex-1">
              <label className="text-sm font-medium">Alkupäivä</label>
              <Popover open={openStartDate} onOpenChange={setOpenStartDate}>
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
                    defaultMonth={startDate}
                    onSelect={(value) => {
                      setStartDate(value as Date)
                      setOpenStartDate(false)
                    }}
                    required
                    initialFocus
                    locale={fi}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2 flex-1">
              <label className="text-sm font-medium">Loppupäivä</label>
              <Popover open={openEndDate} onOpenChange={setOpenEndDate}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {endDate ? formatDate(endDate) : <span>Select date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={endDate}
                    defaultMonth={endDate}
                    onSelect={(value) => {
                      setEndDate(value as Date)
                      setOpenEndDate(false)
                    }}
                    required
                    locale={fi}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex justify-end items-end gap-2 md:flex-row md:items-end md:justify-end">
              <Button onClick={getReport} disabled={loading}>
                <Download className="w-4 h-4 mr-2" />
                {' '}
                Lataa
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </SiikliPage>
  )
}
