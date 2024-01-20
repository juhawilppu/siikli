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
  TextField,
  TextareaAutosize,
} from '@mui/material'
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { Columns, MainSave, Page, SideBySide } from '../../components'

export interface CustomerDto {
  id: number
  chain: string
  name: string
}

const OrderEdit = () => {
  const [customers, setCustomers] = useState<CustomerDto[]>()
  const [customerId, setCustomerId] = useState<number>()
  const [deliveryDate, setDeliveryDate] = useState<string | null>(null)
  const [hasNote, setHasNote] = useState(false)
  const [noteHeader, setNoteHeader] = useState<string | null>(null)
  const [noteBody, setNoteBody] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios
      .get('/customers')
      .then((response) => setCustomers(response.data))
      .finally(() => setLoading(false))
  }, [])

  const handleCustomerChange = (event: SelectChangeEvent) => {
    setCustomerId(parseInt(event.target.value))
  }

  const handleDateChange = (value: string | null) => {
    console.log(value)
    //setDeliveryDate(moment(value, 'DD.MM.YYYY').toDate())
    setDeliveryDate(value)
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
            onChange={handleCustomerChange}
          >
            {customers.map((customer: CustomerDto) => (
              <MenuItem key={customer.id} value={customer.id}>
                {customer.chain} {customer.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <LocalizationProvider dateAdapter={AdapterMoment}>
          <DesktopDatePicker
            format='DD.MM.YYYY'
            label='Toimituspäivä'
            value={deliveryDate}
            onChange={handleDateChange}
          />
        </LocalizationProvider>
      </SideBySide>
      <FormControlLabel
        control={
          <Checkbox value={hasNote} onChange={() => setHasNote(!hasNote)} />
        }
        label='Lisää kuormakirjaan huomautus'
      />
      {hasNote && (
        <Columns>
          <TextField
            id='outlined-basic'
            label='Huomautuksen otsikko'
            variant='outlined'
            value={noteHeader}
            onChange={(e) => setNoteHeader(e.target.value)}
          />
          <TextareaAutosize
            placeholder='Huomautuksen teksti'
            value={noteBody || ''}
            minRows={5}
            onChange={(e) => setNoteBody(e.target.value)}
          ></TextareaAutosize>
        </Columns>
      )}
      <div>Sinun täytyy valita asiakas ennen kuin voit syöttää tuotteet.</div>
    </Page>
  )
}

export default OrderEdit
