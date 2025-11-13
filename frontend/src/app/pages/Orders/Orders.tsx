import { endOfWeek, startOfWeek } from 'date-fns'
import { NavLink } from 'react-router-dom'
import OrderListBase from '@/app/components/OrderListBase'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/translations'

export default function Orders() {
  const t = useTranslation()
  const now = new Date()

  return (
    <OrderListBase
      title={t('orders.title')}
      description={t('orders.description')}
      defaultStartDate={startOfWeek(now, { weekStartsOn: 1 })}
      defaultEndDate={endOfWeek(now, { weekStartsOn: 1 })}
      emptyStateComponent={(
        <div className="flex flex-col items-center justify-center gap-4">
          <span className="text-center">
            {t('orders.emptyState.description')}
          </span>
          <Button
            asChild
            size="lg"
            className="px-8 py-4 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition"
          >
            <NavLink to="/orders/new">{t('orders.emptyState.newOrder')}</NavLink>
          </Button>
        </div>
      )}
    >
    </OrderListBase>
  )
}
