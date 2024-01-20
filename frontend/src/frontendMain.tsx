import { ThemeProvider, createTheme } from '@mui/material'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'

import { fiFI as coreFiFi } from '@mui/material/locale'
import { fiFI } from '@mui/x-date-pickers/locales'

const theme = createTheme(
  {
    palette: {
      primary: { main: '#1976d2' },
    },
  },
  fiFI, // x-date-pickers translations

  coreFiFi // core translations
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
)
