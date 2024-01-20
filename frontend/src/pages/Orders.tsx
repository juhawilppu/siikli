import { LinearProgress } from '@mui/material'
import axios from 'axios'
import { useEffect, useState } from 'react'

export const Orders = () => {
  const [orders, setOrders] = useState<any[]>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios
      .get('/orders')
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
      {orders.map(() => (
        <div>moi</div>
      ))}
    </>
  )
}
