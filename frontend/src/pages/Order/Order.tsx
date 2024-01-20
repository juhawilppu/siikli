import axios from 'axios'
import { useEffect, useState } from 'react'

import { CircularProgress } from '@mui/material'
import moment from 'moment'
import 'moment/locale/fi'
import OrderEdit from './OrderEdit'
import OrderView from './OrderView'

import { useParams } from 'react-router-dom'

moment.locale('fi')
moment.defaultFormat = 'DD.MM.YYYY'

const Order = () => {
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState()
  const [orderProducts, setOrderProducts] = useState()
  const [edit, setEdit] = useState(params.edit === 'edit')

  useEffect(() => {
    if (params.orderId) {
      const orderId = params.orderId

      const orderPromise = axios.get(`/api/orders/${orderId}`)
      const orderProductPromise = axios.get(`/api/orders/${orderId}/products`)

      Promise.all([orderPromise, orderProductPromise]).then((response) => {
        setLoading(false)
        setOrder(response[0].data)
        setOrderProducts(response[1].data)
      })
    }
  })

  const changeToEdit = () => {
    setEdit(!edit)
  }

  const save = async (order: any, orderProducts: any) => {
    const response = await axios.post(`/api/orders`, {
      order,
      orderProducts,
    })

    setOrder(response.data.order)
    setOrderProducts(response.data.orderProduct)
    setEdit(false)
  }

  const cancel = () => {
    setEdit(false)
  }

  if (loading) {
    return (
      <div style={{ marginTop: '50px' }}>
        <CircularProgress />
      </div>
    )
  }

  if (edit) {
    return (
      <OrderEdit
        order={order}
        orderProducts={orderProducts}
        save={save}
        cancel={cancel}
      />
    )
  } else {
    return (
      <OrderView
        order={order}
        orderProducts={orderProducts}
        changeToEdit={changeToEdit}
      />
    )
  }
}

export default Order
