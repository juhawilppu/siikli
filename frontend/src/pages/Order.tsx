import axios from 'axios'
import { useEffect } from 'react'

export const Order = () => {
  useEffect(() => {
    axios.get('/api/order')
  }, [])

  return <h1>Tiaus</h1>
}
