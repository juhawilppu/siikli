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
import { MainSave, Page, SideBySide } from '../../components'

export interface CustomerDto {
  id: number
  chain: string
  name: string
}

const OrderEdit = () => {
  const [customers, setCustomers] = useState<CustomerDto[]>()
  const [customerId, setCustomerId] = useState<number>()
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
    setCustomerId(parseInt(event.target.value))
  }

  if (loading || !customers) return <LinearProgress />

  return (
    <Page>
      <h1>Uusi tilaus</h1>
      <MainSave>
        <Button variant='contained' startIcon={<SaveOutlined />}>
          Tallenna
        </Button>
      </MainSave>
      <SideBySide>
        <FormControl fullWidth>
          <InputLabel id='order-customer'>Asiakas</InputLabel>
          <Select
            labelId='order-customer'
            id='order-customer'
            value={customerId ? customerId + '' : ''}
            label='Asiakas'
            onChange={handleChange}
          >
            {customers.map((customer: CustomerDto) => (
              <MenuItem value={customer.id}>
                {customer.chain} {customer.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <LocalizationProvider dateAdapter={AdapterMoment}>
          <DesktopDatePicker label='Toimituspäivä' />
        </LocalizationProvider>
      </SideBySide>
      <FormControlLabel
        control={<Checkbox value={hasNote} />}
        label='Lisää kuormakirjaan huomautus'
      />
      <div>Sinun täytyy valita asiakas ennen kuin voit syöttää tuotteet.</div>
    </Page>
  )
}

export default OrderEdit
