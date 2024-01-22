import { LinearProgress } from '@mui/material'
import { DatePicker, LocalizationProvider, fiFI } from '@mui/x-date-pickers'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import axios from 'axios'
import moment, { Moment } from 'moment'
import { useEffect, useState } from 'react'
import { Page, SideBySide } from '../components'
import { GetOrderList } from '../types/types'

export const Orders = () => {
  const [orders, setOrders] = useState<GetOrderList[]>()
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState<Moment>(
    moment().clone().weekday(1)
  )
  const [endDate, setEndDate] = useState(
    moment().clone().weekday(1).add(7, 'day')
  )

  const handleStartDateChange = (value: Moment | null) => {
    if (value) setStartDate(value)
  }

  const handleEndDateChange = (value: Moment | null) => {
    if (value) setEndDate(value)
  }

  useEffect(() => {
    axios
      .get<GetOrderList[]>('/orders', {
        params: {
          startDate: startDate.format('YYYY-MM-DD'),
          endDate: endDate.format('YYYY-MM-DD'),
        },
      })
      .then((response) => setOrders(response.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LinearProgress />

  if (!orders) {
    return <div>Ei tilauksia</div>
  }

  return (
    <Page>
      <h1>Tilaukset</h1>
      <SideBySide>
        <LocalizationProvider
          dateAdapter={AdapterMoment}
          adapterLocale='fi'
          localeText={
            fiFI.components.MuiLocalizationProvider.defaultProps.localeText
          }
        >
          <DatePicker
            format='DD.MM.YYYY'
            label='Aloitus'
            value={startDate}
            onChange={handleStartDateChange}
          />
        </LocalizationProvider>
        <LocalizationProvider
          dateAdapter={AdapterMoment}
          adapterLocale='fi'
          localeText={
            fiFI.components.MuiLocalizationProvider.defaultProps.localeText
          }
        >
          <DatePicker
            format='DD.MM.YYYY'
            label='Lopetus'
            value={endDate}
            onChange={handleEndDateChange}
          />
        </LocalizationProvider>
      </SideBySide>
      <table>
        <thead>
          <tr>
            <th>Toimituspäivä</th>
            <th>Asiakas</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
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
    </Page>
  )
}
