import type { Filters } from '@/app/components/OrderListBase'
import { CreateWaybillsRequest, dateToIso, OrderStatus } from '@siikli/shared'
import axios from 'axios'
import { endOfWeek, startOfWeek } from 'date-fns'
import { Check, Printer } from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import OrderListBase from '@/app/components/OrderListBase'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/translations'
import { typeParse } from '@/lib/validate'
import { LoadingSpinner } from '../components/custom-icons'
import { toast } from '../hooks/use-toast'

export default function Waybills() {
  const t = useTranslation()
  const now = new Date()

  const [isPrinting, setIsPrinting] = useState<'preview' | 'print' | null>(null)

  const handlePrintWaybills = async (preview: boolean, filters: Filters, refresh: () => void) => {
    try {
      setIsPrinting(preview ? 'preview' : 'print')
      const response = await axios.post(
        `/orders/waybills`,
        typeParse(CreateWaybillsRequest, {
          startDate: dateToIso(filters.startDate),
          endDate: dateToIso(filters.endDate),
          customerId: filters.customer?.id,
          preview,
        }),
        { responseType: 'blob' },
      )

      // Create blob URL
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)

      // Create temporary link and trigger download
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${t('waybills.fileName')}-${dateToIso(filters.startDate)}-${dateToIso(filters.endDate)}.pdf`)
      document.body.appendChild(link)
      link.click()

      // Cleanup
      link.remove()
      window.URL.revokeObjectURL(url)
    }
    catch (error) {
      console.error('Error downloading PDF:', error)
      toast({
        title: t('waybills.error.printing.title'),
        description: t('waybills.error.printing.description'),
        variant: 'destructive',
      })
    }
    finally {
      setIsPrinting(null)
      refresh()
    }
  }

  return (
    <OrderListBase
      title={t('waybills.title')}
      description={t('waybills.description')}
      defaultStartDate={startOfWeek(now, { weekStartsOn: 1 })}
      defaultEndDate={endOfWeek(now, { weekStartsOn: 1 })}
      status={OrderStatus.WAITING_FOR_DELIVERY}
      emptyStateComponent={(
        <div className="flex flex-col items-center justify-center gap-4">
          <span className="text-center">
            { t('waybills.emptyState.description') }
          </span>
          <Button
            asChild
            size="lg"
            className="px-8 py-4 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition"
          >
            <NavLink to="/app/orders/new">{t('waybills.emptyState.newOrder')}</NavLink>
          </Button>
        </div>
      )}
      actionComponent={(filters: Filters, orderCount: number, refresh: () => void) => {
        return (
          <div>
            <div className="flex flex-col w-full gap-2 sm:gap-4 sm:flex-row-reverse sm:items-center">
              <Button
                variant="default"
                onClick={() => handlePrintWaybills(false, filters, refresh)}
                className="w-full sm:w-auto"
                disabled={orderCount === 0 || isPrinting !== null}
              >
                {isPrinting === 'print'
                  ? (
                      <>
                        <LoadingSpinner />
                        {t('waybills.confirmAndPrint')}
                      </>
                    )
                  : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        {t('waybills.confirmAndPrint')}
                      </>
                    )}
              </Button>
              <Button
                variant="outline"
                onClick={() => handlePrintWaybills(true, filters, refresh)}
                className="w-full sm:w-auto"
                disabled={orderCount === 0 || isPrinting !== null}
              >
                {isPrinting === 'preview'
                  ? (
                      <>
                        <LoadingSpinner />
                        {t('waybills.preview')}
                      </>
                    )
                  : (
                      <>
                        <Printer className="mr-2 h-4 w-4" />
                        {t('waybills.preview')}
                      </>
                    )}
              </Button>
            </div>
          </div>
        )
      }}
    >
    </OrderListBase>
  )
}
