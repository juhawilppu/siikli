import { SaveOutlined } from '@mui/icons-material'
import { Button, TextField } from '@mui/material'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { Columns, Page } from '../components'

export const OwnCompany = () => {
  const companyId = 1
  const [companyName, setCompanyName] = useState('')
  const [businessId, setBusinessId] = useState('')
  const [address1, setAddress1] = useState('')
  const [address2, setAddress2] = useState('')
  const [invoiceBankName, setInvoiceBankName] = useState('')
  const [invoiceBankNumber, setInvoiceBankNumber] = useState('')
  const [invoiceReference, setInvoiceReference] = useState('')
  const [invoiceSumRow, setInvoiceSumRow] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    axios
      .get(`/companies/${companyId}`)
      .then((response) => {
        setCompanyName(response.data.companyName)
        setBusinessId(response.data.businessId)
        setAddress1(response.data.address1)
        setAddress2(response.data.address2)
        setInvoiceBankName(response.data.invoiceBankName)
        setInvoiceBankNumber(response.data.invoiceBankNumber)
        setInvoiceReference(response.data.invoiceReference)
        setInvoiceSumRow(response.data.invoiceSumRow)
      })
      .finally(() => setLoading(false))
  }, [])

  const save = () => {
    axios.post(`/companies/${companyId}`, {
      companyName,
      businessId,
      address1,
      address2,
      invoiceBankName,
      invoiceBankNumber,
      invoiceReference,
      invoiceSumRow,
    })
  }

  if (loading) return <div></div>

  return (
    <Page>
      <h1>Yritys</h1>
      <Columns>
        <TextField
          id='outlined-basic'
          label='Nimi'
          variant='outlined'
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />
        <TextField
          id='outlined-basic'
          label='Y-tunnus'
          variant='outlined'
          value={businessId}
          onChange={(e) => setBusinessId(e.target.value)}
        />
        <TextField
          id='outlined-basic'
          label='Osoite'
          variant='outlined'
          value={address1}
          onChange={(e) => setAddress1(e.target.value)}
        />
        <TextField
          id='outlined-basic'
          label='Osoite 2'
          variant='outlined'
          value={address2}
          onChange={(e) => setAddress2(e.target.value)}
        />
        <TextField
          id='outlined-basic'
          label='Pankin nimi'
          variant='outlined'
          value={invoiceBankName}
          onChange={(e) => setInvoiceBankName(e.target.value)}
        />
        <TextField
          id='outlined-basic'
          label='Pankin numero'
          variant='outlined'
          value={invoiceBankNumber}
          onChange={(e) => setInvoiceBankNumber(e.target.value)}
        />
        <TextField
          id='outlined-basic'
          label='Laskun viite'
          variant='outlined'
          value={invoiceReference}
          onChange={(e) => setInvoiceReference(e.target.value)}
        />
        <TextField
          id='outlined-basic'
          label='Laskun summarivi'
          variant='outlined'
          value={invoiceSumRow}
          onChange={(e) => setInvoiceSumRow(e.target.value)}
        />
        <Button variant='contained' startIcon={<SaveOutlined />} onClick={save}>
          Tallenna
        </Button>
      </Columns>
    </Page>
  )
}
