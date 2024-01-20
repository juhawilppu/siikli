import { SaveOutlined } from '@mui/icons-material'
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material'
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import axios from 'axios'
import { useEffect, useState } from 'react'

const OrderEdit = () => {
  const [customers, setCustomers] = useState<any[]>()
  const [customer, setCustomer] = useState<number>()
  const [deliveryDate, setDeliveryDate] = useState()
  const [hasNote, setHasNote] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios
      .get('/customers')
      .then((response) => setCustomers(response.data))
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (event: SelectChangeEvent) => {
    setCustomer(parseInt(event.target.value))
  }

  if (loading || !customers) return <LinearProgress />

  return (
    <div>
      <h1>Uusi tilaus</h1>
      <Button variant='contained' startIcon={<SaveOutlined />}>
        Tallenna
      </Button>
      <div>
        <FormControl fullWidth>
          <InputLabel id='order-customer'>Asiakas</InputLabel>
          <Select
            labelId='order-customer'
            id='order-customer'
            value={customer + ''}
            label='Asiakas'
            onChange={handleChange}
          >
            {customers.map((customer: any) => (
              <MenuItem value={customer.id}>{customer.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <LocalizationProvider dateAdapter={AdapterMoment}>
          <DesktopDatePicker label='Toimituspäivä' />
        </LocalizationProvider>
      </div>
      <FormControlLabel
        control={<Checkbox value={hasNote} />}
        label='Lisää kuormakirjaan huomautus'
      />
      <div>Sinun täytyy valita asiakas ennen kuin voit syöttää tuotteet.</div>
    </div>
  )
}

export default OrderEdit
