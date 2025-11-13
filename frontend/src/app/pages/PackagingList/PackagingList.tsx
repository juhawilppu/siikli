import type { GetPackagingListGroupedByCustomerResponse, GetPackagingListGroupedByProductResponse } from '@siikli/shared'
import { dateToIso, formatDate, GetPackagingListQuery } from '@siikli/shared'
import axios from 'axios'
import { enUS, fi } from 'date-fns/locale'
import Decimal from 'decimal.js'
import { Calendar, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { LoadingSpinner } from '@/app/components/custom-icons'
import SiikliPage from '@/app/components/SiikliPage'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useApp } from '@/context/AppContext.js'
import { useTranslation } from '@/lib/translations.js'
import PackagingListByCustomer from './PackagingListByCustomer.js'
import PackagingListByProduct from './PackagingListByProduct.js'

type CustomerReport = GetPackagingListGroupedByCustomerResponse
type ProductReport = GetPackagingListGroupedByProductResponse

export function PackagingList() {
  const { language } = useApp()
  const t = useTranslation()

  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(new Date())
  const [groupBy, setGroupBy] = useState<'customer' | 'product'>('customer')
  const [isLoading, setIsLoading] = useState(false)
  const [openDeliveryDate, setOpenDeliveryDate] = useState(false)
  const [customerReport, setCustomerReport] = useState<CustomerReport>()
  const [productReport, setProductReport] = useState<ProductReport>()

  const handleFetch = async () => {
    if (!deliveryDate) {
      return
    }
    setIsLoading(true)

    try {
      const res = await axios.get<CustomerReport | ProductReport>(`/packaging-list/grouped-by/${groupBy}`, {
        params: GetPackagingListQuery.parse({
          deliveryDate: dateToIso(deliveryDate),
        }),
      })

      const mappedRows = res.data.rows.map(item => ({
        ...item,
        amount: new Decimal(item.amount),
      }))

      if (groupBy === 'customer') {
        setCustomerReport({
          ...res.data,
          rows: mappedRows,
        } as CustomerReport)
        setProductReport(undefined)
      }
      else {
        setProductReport({
          ...res.data,
          rows: mappedRows,
        } as ProductReport)
        setCustomerReport(undefined)
      }
    }
    finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <SiikliPage title={t('packagingList.title')} description={t('packagingList.description')}>
        <Card>
          <CardHeader className="border-b bg-gray-50">
            <CardTitle>{t('packagingList.create.title')}</CardTitle>
            <CardDescription className="text-gray-700">{t('packagingList.create.description')}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="delivery-date" className="font-medium">
                  {t('packagingList.deliveryDate.title')}
                </Label>
                <Popover open={openDeliveryDate} onOpenChange={setOpenDeliveryDate}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      id="delivery-date"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {deliveryDate ? formatDate(deliveryDate) : <span>{t('packagingList.deliveryDate.select')}</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={deliveryDate}
                      defaultMonth={deliveryDate}
                      onSelect={(value: Date | undefined) => {
                        setDeliveryDate(value)
                        setCustomerReport(undefined)
                        setProductReport(undefined)
                        setOpenDeliveryDate(false)
                      }}
                      initialFocus
                      locale={language === 'fi' ? fi : enUS}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="font-medium">{t('packagingList.groupBy.title')}</Label>
                <RadioGroup
                  value={groupBy}
                  onValueChange={(value: 'customer' | 'product') => {
                    setGroupBy(value)
                    setCustomerReport(undefined)
                    setProductReport(undefined)
                  }}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="customer" id="group-customer" />
                    <Label htmlFor="group-customer">{t('packagingList.groupBy.customer')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="product" id="group-product" />
                    <Label htmlFor="group-product">{t('packagingList.groupBy.product')}</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-5 border-t bg-gray-50 flex justify-end items-center gap-2">
            <Button onClick={handleFetch} disabled={isLoading} className="bg-primary hover:bg-primary/90">
              {isLoading
                ? (
                    <>
                      <LoadingSpinner />
                      {t('packagingList.create.button')}
                    </>
                  )
                : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      {t('packagingList.create.button')}
                    </>
                  )}
            </Button>
          </CardFooter>
        </Card>
        {(customerReport || productReport) && (
          <Card className="p-5 overflow-x-auto">
            <div className="min-w-[320px]">
              {(!customerReport?.rows.length && !productReport?.rows.length) && (
                <div className="flex justify-center items-center h-full">
                  <p className="text-sm text-muted-foreground">{t('packagingList.emptyState.description')}</p>
                </div>
              )}
              {!!customerReport?.rows.length && (
                <>
                  <div className="flex justify-end">
                    <Button variant="outline" onClick={() => window.print()}>{t('packagingList.print')}</Button>
                  </div>
                  <PackagingListByCustomer
                    report={customerReport}
                  />
                </>
              )}
              {!!productReport?.rows.length && (
                <>
                  <div className="flex justify-end">
                    <Button variant="outline" onClick={() => window.print()}>{t('packagingList.print')}</Button>
                  </div>
                  <PackagingListByProduct
                    report={productReport}
                  />
                </>
              )}
            </div>
          </Card>
        )}
      </SiikliPage>
    </>
  )
}
