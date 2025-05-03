import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'

import { PostHogProvider } from 'posthog-js/react'
import * as Sentry from "@sentry/react"

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: "https://81122283b2fb5988215096c417c48bbf@o4509186086273024.ingest.de.sentry.io/4509186093154384"
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PostHogProvider
      apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
      options={{
        api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
        debug: import.meta.env.MODE === "development",
      }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </PostHogProvider>
  </React.StrictMode>
)
