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
import moment, { Moment } from 'moment'
import { useEffect, useState } from 'react'
import { Columns, MainSave, Page, SideBySide } from '../../components'
import { ProductOrderDto } from '../../types/types'

export interface CustomerDto {
  id: number
  chain: string
  name: string
}

export interface ProductDto {
  id: number
  chain: string
  name: string
  price: number
}

const packageSizes = [12, 20, 25, 120, 200, 250]
const packageTypes = ['Ltk', 'SS', 'A', 'Ap', 'P', 'Pnt', 'PSS', 'HYV']

const OrderEdit = () => {
  const [customers, setCustomers] = useState<CustomerDto[]>()
  const [products, setProducts] = useState<ProductDto[]>()
  const [customerId, setCustomerId] = useState<number>(20)
  const [deliveryDate, setDeliveryDate] = useState<Moment | null>(moment())
  const [hasNote, setHasNote] = useState(false)
  const [noteHeader, setNoteHeader] = useState<string | null>(null)
  const [noteBody, setNoteBody] = useState<string | null>(null)
  const [rows, setRows] = useState<ProductOrderDto[]>([
    {
      productId: 96,
      amount: 200,
      packageSize: 12,
      packageType: 'A',
      price: 0.4,
      freetext: 'moi',
    },
  ])
  const [loading, setLoading] = useState(true)

  console.log(deliveryDate)

  useEffect(() => {
    Promise.all([axios.get('/customers'), axios.get('/products')])
      .then((responses) => {
        setCustomers(responses[0].data)
        setProducts(responses[1].data)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleCustomerChange = (event: SelectChangeEvent) => {
    setCustomerId(parseInt(event.target.value))
  }

  const handleRowChange = (row: any, field: string) => (event: any) => {
    if (!products) {
      return
    }
    if (field === 'amount') {
      setRows([
        ...rows.filter((r) => r !== row),
        {
          ...row,
          amount: parseInt(event.target.value),
        },
      ])
    } else if (field === 'productId') {
      const product = products.find((p) => p.id === event.target.value)
      if (!product) {
        return
      }
      setRows([
        ...rows.filter((r) => r !== row),
        {
          ...row,
          productId: product.id,
          price: product.price,
        },
      ])
    } else {
      setRows([
        ...rows.filter((r) => r !== row),
        {
          ...row,
          [field]: event.target.value,
        },
      ])
    }
  }

  const handleDateChange = (value: Moment | null) => {
    console.log(value)
    //setDeliveryDate(moment(value, 'DD.MM.YYYY').toDate())
    setDeliveryDate(value)
  }

  const save = () => {
    axios.post('/orders', {
      deliveryDate: deliveryDate?.format('YYYY-MM-DD'),
      customerId,
      hasNote,
      noteBody,
      noteHeader,
      rows,
    })
  }

  if (loading || !customers || !products) return <LinearProgress />

  return (
    <Page>
      <h1>Uusi tilaus</h1>
      <MainSave>
        <Button variant='contained' startIcon={<SaveOutlined />} onClick={save}>
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
                    key={row.productId}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell scope='row'>
                      <FormControl fullWidth>
                        <InputLabel id='order-customer'>Tuote</InputLabel>
                        <Select
                          labelId='order-customer'
                          id='order-customer'
                          value={row.productId ? row.productId + '' : ''}
                          label='Asiakas'
                          onChange={handleRowChange(row, 'productId')}
                        >
                          {products.map((product) => (
                            <MenuItem key={product.id} value={product.id}>
                              {product.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell align='right'>
                      <TextField
                        value={row.amount || ''}
                        onChange={handleRowChange(row, 'amount')}
                      ></TextField>
                    </TableCell>
                    <TableCell align='right'>
                      <FormControl fullWidth>
                        <InputLabel id='order-package-size'>
                          Pakkauskoko
                        </InputLabel>
                        <Select
                          labelId='order-package-size'
                          id='order-package-size'
                          value={row.packageSize ? row.packageSize + '' : ''}
                          label='Pakkauskoko'
                          onChange={handleRowChange(row, 'packageSize')}
                        >
                          {packageSizes.map((packageSize) => (
                            <MenuItem key={packageSize} value={packageSize}>
                              {packageSize}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell align='right'>
                      <FormControl fullWidth>
                        <InputLabel id='order-package-size'>
                          Pakkaustyyppi
                        </InputLabel>
                        <Select
                          labelId='order-package-type'
                          id='order-package-type'
                          value={row.packageType ? row.packageType + '' : ''}
                          label='Pakkaustyyppi'
                          onChange={handleRowChange(row, 'packageType')}
                        >
                          {packageTypes.map((packageType) => (
                            <MenuItem key={packageType} value={packageType}>
                              {packageType}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell align='right'>
                      {row.amount / row.packageSize}
                    </TableCell>
                    <TableCell align='right'>
                      <TextField
                        value={row.price || ''}
                        onChange={handleRowChange(row, 'price')}
                      ></TextField>
                    </TableCell>
                    <TableCell align='right'>
                      <TextField
                        value={row.freetext || ''}
                        onChange={handleRowChange(row, 'freetext')}
                      ></TextField>
                    </TableCell>
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
