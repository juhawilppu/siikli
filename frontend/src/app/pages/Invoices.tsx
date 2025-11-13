import type { Filters } from '@/app/components/OrderListBase'
import { dateToIso, OrderStatus, PostCreateInvoiceRequest } from '@siikli/shared'
import axios from 'axios'
import { endOfWeek, startOfWeek } from 'date-fns'
import { Check, Printer } from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import OrderListBase from '@/app/components/OrderListBase'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/translations'
import { LoadingSpinner } from '../components/custom-icons'
import { toast } from '../hooks/use-toast'

export default function Invoices() {
  const t = useTranslation()
  const now = new Date()

  const [isPrinting, setIsPrinting] = useState<'preview' | 'print' | null>(null)

  const handlePrintInvoices = async (preview = false, filters: Filters, refresh: () => void) => {
    if (!filters.customer) {
      toast({
        title: t('invoices.error.noCustomerSelected.title'),
        description: t('invoices.error.noCustomerSelected.description'),
      })
      return
    }
    try {
      setIsPrinting(preview ? 'preview' : 'print')
      const body = PostCreateInvoiceRequest.parse({
        customerId: filters.customer.id,
        startDate: dateToIso(filters.startDate),
        endDate: dateToIso(filters.endDate),
        preview,
      })
      const response = await axios.post(
        `/invoices`,
        body,
        { responseType: 'blob' },
      )

      // Create blob URL
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)

      // Create temporary link and trigger download
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${t('invoices.fileName')}-${filters.customer.name.toLowerCase().replace(/ /g, '-')}-${dateToIso(filters.startDate)}-${dateToIso(filters.endDate)}.pdf`)
      document.body.appendChild(link)
      link.click()

      // Cleanup
      link.remove()
      window.URL.revokeObjectURL(url)
    }
    catch (error: any) {
      if (error.response.status === 400) {
        toast({
          title: t('invoices.error.missingBankAccount.title'),
          description: t('invoices.error.missingBankAccount.description'),
          variant: 'destructive',
        })
      }
      else {
        toast({
          title: t('waybills.error.printing.title'),
          description: t('waybills.error.printing.description'),
          variant: 'destructive',
        })
      }
    }
    finally {
      setIsPrinting(null)
      refresh()
    }
  }

  return (
    <OrderListBase
      title={t('invoices.title')}
      description={t('invoices.description')}
      defaultStartDate={startOfWeek(now, { weekStartsOn: 1 })}
      defaultEndDate={endOfWeek(now, { weekStartsOn: 1 })}
      status={OrderStatus.DELIVERED}
      emptyStateComponent={(
        <div className="flex flex-col items-center justify-center gap-4">
          <span className="text-center">
            {t('invoices.emptyState.description')}
          </span>
          <Button
            asChild
            size="lg"
            className="px-8 py-4 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition"
          >
            <NavLink to="/app/waybills">{t('invoices.printWaybills')}</NavLink>
          </Button>
        </div>
      )}
      actionComponent={(filters: Filters, orderCount: number, refresh: () => void) => (
        <div>
          <div className="flex flex-col w-full gap-2 sm:gap-4 sm:flex-row-reverse sm:items-center">
            <Button
              variant="default"
              onClick={() => handlePrintInvoices(false, filters, refresh)}
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
              onClick={() => handlePrintInvoices(true, filters, refresh)}
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
      )}
    >
    </OrderListBase>
  )
}
