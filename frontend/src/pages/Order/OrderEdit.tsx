import { Add, SaveOutlined } from '@mui/icons-material'
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  TextareaAutosize,
} from '@mui/material'
import { DatePicker, LocalizationProvider, fiFI } from '@mui/x-date-pickers'
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
  const [customerId, setCustomerId] = useState<number>(20)
  const [deliveryDate, setDeliveryDate] = useState<string | null>(null)
  const [hasNote, setHasNote] = useState(false)
  const [noteHeader, setNoteHeader] = useState<string | null>(null)
  const [noteBody, setNoteBody] = useState<string | null>(null)
  const [rows, setRows] = useState<any[]>([])
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
        <LocalizationProvider
          dateAdapter={AdapterMoment}
          adapterLocale='fi'
          localeText={
            fiFI.components.MuiLocalizationProvider.defaultProps.localeText
          }
        >
          <DatePicker
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
      {!customerId && (
        <div>Sinun täytyy valita asiakas ennen kuin voit syöttää tuotteet.</div>
      )}
      {customerId && (
        <>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label='simple table'>
              <TableHead>
                <TableRow>
                  <TableCell>Tuote</TableCell>
                  <TableCell align='right'>Määrä (kg)</TableCell>
                  <TableCell align='right'>Pakkauskoko</TableCell>
                  <TableCell align='right'>Tyyppi</TableCell>
                  <TableCell align='right'>Kappaletta</TableCell>
                  <TableCell align='right'>Hinta (€/kg), ALV 14 %</TableCell>
                  <TableCell align='right'>Lisätietoa</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow
                    key={row.name}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell scope='row'>{row.name}</TableCell>
                    <TableCell align='right'>{row.calories}</TableCell>
                    <TableCell align='right'>{row.fat}</TableCell>
                    <TableCell align='right'>{row.carbs}</TableCell>
                    <TableCell align='right'>{row.protein}</TableCell>
                  </TableRow>
                ))}
                {rows.length == 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align='center'>
                      Ei tuotteita.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <SideBySide>
            <p>Vain tuotteet joiden asiakasryhmä on tyhjä</p>
            <Button startIcon={<Add />}>Lisää tuote</Button>
          </SideBySide>
        </>
      )}
    </Page>
  )
}

export default OrderEdit
