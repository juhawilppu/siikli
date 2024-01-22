import { LinearProgress } from '@mui/material'
import axios from 'axios'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { GetOrderList } from '../types/types'

export const Orders = () => {
  const [orders, setOrders] = useState<GetOrderList[]>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios
      .get<GetOrderList[]>('/orders')
      .then((response) => setOrders(response.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LinearProgress />

  if (!orders) {
    return <div>Ei tilauksia</div>
  }

  return (
    <>
      <h1>Tilaukset</h1>
      <table>
        <thead>
          <th>Toimituspäivä</th>
          <th>Asiakas</th>
          <th></th>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr>
              <td>
                {moment(order.deliveryDate, 'YYYY-MM-DD').format('D.M.YYYY')}
              </td>
              <td>
                {order.customer.chain} {order.customer.name}
              </td>
              <td>Avaa</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
