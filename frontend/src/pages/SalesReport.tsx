import { Button } from '@mui/material'
import { DatePicker, fiFI, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import moment, { Moment } from 'moment'
import { useState } from 'react'
import { Ingress, Page, SideBySide } from '../components'

export const SalesReport = () => {
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

    const getReport = async () => {
        const res = await fetch('/api/sales-report');
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'order-products.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
    };


    return (
        <Page>
            <h1>Myyntiraportti</h1>
            <Ingress>
                Hinnan muuttaminen ei muuta tuotteiden hintoja nykyisissä tilauksissa,
                vain automaattisesti ehdotettavaa hintaa tulevissa tilauksissa.
            </Ingress>
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
            <Button onClick={getReport}>Tulosta</Button>
        </Page>
    )
}
