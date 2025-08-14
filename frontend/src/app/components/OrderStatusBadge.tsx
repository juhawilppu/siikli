import { Badge } from '@/components/ui/badge'

interface OrderStatusBadgeProps {
  status: 'WAITING_FOR_DELIVERY' | 'DELIVERED' | 'INVOICED'
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  switch (status) {
    case 'WAITING_FOR_DELIVERY':
      return <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">Odottaa toimitusta</Badge>
    case 'DELIVERED':
      return <Badge variant="outline" className="bg-sky-100 text-sky-700 border-sky-200">Toimitettu</Badge>
    case 'INVOICED':
      return <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200">Laskutettu</Badge>
  }
}
