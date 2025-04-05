import { WarehouseReportRow } from '@/types/types'
import { Button } from '@mui/material'
import { DatePicker, fiFI, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import axios from 'axios'
import moment, { Moment } from 'moment'
import { useState } from 'react'
import { SideBySide } from '../components'
import { WarehouseReportByCustomer } from './WarehouseReportByCustomer'

export const PackageList = () => {
    const [date, setDate] = useState<Moment>(
        moment().clone()
    )
    const [report, setReport] = useState<WarehouseReportRow[]>()

    const handleDateChange = (value: Moment | null) => {
        if (value) setDate(value)
    }

    const fetchData = async () => {
        const res = await axios.get('/warehouse-report/grouped-by-customer', {
            params: {
                deliveryDate: date.format('YYYY-MM-DD')
            }
        })
        console.log('report', res.data)
        setReport(res.data)
    }

    return (
        <>
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Pakkauslista</h1>
                <p className="text-muted-foreground">Voit tulostaa pakkauslistan täältä.</p>
            </div>
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
                        label='Päivämäärä'
                        value={date}
                        onChange={handleDateChange}
                    />
                </LocalizationProvider>
            </SideBySide>
            <Button onClick={fetchData}>Hae tiedot</Button>
            {report && <WarehouseReportByCustomer
                reportDate={date.toDate()} reportData={report} getSum={() => 0} />}
        </>
    )
}
