import type { WarehouseReportByCustomer, WarehouseReportByProduct } from '@/types/types'
import axios from 'axios'
import { Calendar, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import SiikliPage from '@/SiikliPage'
import { dateToString, formatDate } from '@/utils/date'
import WarehouseReportByCustomerDocument from './WarehouseReportByCustomer'
import WarehouseReportByProductDocument from './WarehouseReportByProduct'

export function PackageList() {
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(new Date())
  const [groupBy, setGroupBy] = useState<'customer' | 'product'>('customer')
  const [isLoading, setIsLoading] = useState(false)

  const [report, setReport] = useState<WarehouseReportByProduct | WarehouseReportByCustomer>()

  const handleFetch = async () => {
    if (!deliveryDate) {
      return
    }
    setIsLoading(true)
    const res = await axios.get(`/warehouse-report/grouped-by/${groupBy}`, {
      params: {
        deliveryDate: dateToString(deliveryDate),
      },
    })
    console.log('report', res.data)
    setReport(res.data)
    setIsLoading(false)
  }

  return (
    <>
      <SiikliPage title="Pakkauslista" description="Voit tulostaa pakkauslistan täältä">
        <Card>
          <CardHeader className="border-b bg-gray-50">
            <CardTitle>Luo pakkauslista</CardTitle>
            <CardDescription>Valitse toimituspäivä ja tyyppi</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="delivery-date" className="font-medium">
                  Toimituspäivä
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      id="delivery-date"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {deliveryDate ? formatDate(deliveryDate) : <span>Select date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={deliveryDate}
                      onSelect={(value: Date | undefined) => { setDeliveryDate(value); setReport(undefined) }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="font-medium">Ryhmittely</Label>
                <RadioGroup value={groupBy} onValueChange={(value: 'customer' | 'product') => { setGroupBy(value); setReport(undefined) }} className="flex gap-6">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="customer" id="group-customer" />
                    <Label htmlFor="group-customer">Asiakkaan mukaan</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="product" id="group-product" />
                    <Label htmlFor="group-product">Tuotteen mukaan</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t bg-gray-50 flex justify-end gap-2">
            <Button onClick={handleFetch} disabled={isLoading} className="bg-primary hover:bg-primary/90">
              {isLoading
                ? (
                    <>
                      <svg
                        className="mr-2 h-4 w-4 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        >
                        </circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        >
                        </path>
                      </svg>
                      Luo lista
                    </>
                  )
                : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Luo lista
                    </>
                  )}
            </Button>
          </CardFooter>
        </Card>
        {report && (
          <Card className="p-5">
            <Button onClick={() => window.print()}>Tulosta</Button>
            {report.groupedBy === 'customer' && (
              <WarehouseReportByCustomerDocument
                report={report}
              />
            )}
            {report.groupedBy === 'product' && (
              <WarehouseReportByProductDocument
                report={report}
              />
            )}
          </Card>
        )}
      </SiikliPage>
    </>
  )
}
