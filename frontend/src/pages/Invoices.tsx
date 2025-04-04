import { Button, FormControl, InputLabel, LinearProgress, MenuItem, Select, SelectChangeEvent } from '@mui/material'
import { DatePicker, fiFI, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import axios from 'axios'
import moment, { Moment } from 'moment'
import { useEffect, useState } from 'react'
import { Ingress, Page, SideBySide } from '../components'
import { CustomerInvoiceDto, InvoiceView } from './InvoiceView'
import { CustomerDto } from './Order/Order'

export const Invoices = () => {
    const [customers, setCustomers] = useState<any>()
    const [invoice, setInvoice] = useState<{
        customer: CustomerInvoiceDto,
        orders: any[],
        total: number
    }>()
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

    const [customerId, setCustomerId] = useState<number>(20)

    const handleCustomerChange = (event: SelectChangeEvent) => {
        setCustomerId(parseInt(event.target.value))
    }

    const getData = async () => {
        const invoice = await axios.get('/invoices', {
            params: {
                customerId,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
            }
        })
        console.log('invoice', invoice.data)
        setInvoice(invoice.data)

    }

    useEffect(() => {
        axios
            .get('/customers')
            .then((response) => setCustomers(response.data))
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <LinearProgress />
    if (!customers) return <div>Ei tuotteita</div>

    return (
        <Page>
            <h1>Laskut</h1>
            <Ingress>
                Hinnan muuttaminen ei muuta tuotteiden hintoja nykyisissä tilauksissa,
                vain automaattisesti ehdotettavaa hintaa tulevissa tilauksissa.
            </Ingress>
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

            <Button onClick={getData}>Hae tiedot</Button>
            <Button onClick={print}>Tulosta</Button>
            <div>
                {invoice && <InvoiceView customer={invoice.customer} invoice={{
                    date: '5.5.2025',
                    invoiceId: 'k',
                    paymentCondition: 'k',
                    dueDate: 'k',
                    interestRate: '7',
                    notificationPeriod: '7',
                }} reportData={
                    {
                        totalPages: 1,
                        finalSumWithoutTax: 200,
                        finalSumWithTax: 100,
                        totalTax: 100
                    }
                } isEditMode={true} onChange={() => { }}></InvoiceView>}
            </div>
        </Page>
    )
}
