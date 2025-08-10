import * as Sentry from '@sentry/react'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'

import { AppProvider } from './context/AppContext'
import './globals.css'

if (localStorage.getItem('variant') === null) {
  localStorage.setItem('variant', Math.random() < 0.5 ? 'A' : 'B')
}

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: 'https://81122283b2fb5988215096c417c48bbf@o4509186086273024.ingest.de.sentry.io/4509186093154384',
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <App />
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
