import { endOfWeek, startOfWeek } from 'date-fns'
import { NavLink } from 'react-router-dom'
import OrderListBase from '@/app/components/OrderListBase'
import { Button } from '@/components/ui/button'

export default function Orders() {
  const now = new Date()

  return (
    <OrderListBase
      title="Tilaukset"
      description="Selaa, luo ja hallitse tilauksia."
      defaultStartDate={startOfWeek(now, { weekStartsOn: 1 })}
      defaultEndDate={endOfWeek(now, { weekStartsOn: 1 })}
      emptyStateComponent={(
        <div className="flex flex-col items-center justify-center gap-4">
          <span className="text-center">
            Sinulla ei ole tilauksia tällä aikavälillä.
          </span>
          <Button
            asChild
            size="lg"
            className="px-8 py-4 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition"
          >
            <NavLink to="/orders/new">Luo uusi tilaus</NavLink>
          </Button>
        </div>
      )}
    >
    </OrderListBase>
  )
}
