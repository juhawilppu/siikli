import * as Sentry from '@sentry/react'
import axios from 'axios'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import App from './App'
import { AppProvider } from './context/AppContext'
import ScrollToTop from './lib/ScrollToTop'
import './globals.css'

if (localStorage.getItem('variant') === null) {
  localStorage.setItem('variant', Math.random() < 0.5 ? 'A' : 'B')
}

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: 'https://81122283b2fb5988215096c417c48bbf@o4509186086273024.ingest.de.sentry.io/4509186093154384',
  })
}

axios.defaults.baseURL = '/api'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <AppProvider>
        <App />
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
