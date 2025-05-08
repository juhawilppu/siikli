import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: 5173,
    middlewareMode: false,
    headers: {
      'Content-Security-Policy':
        "default-src 'self'; script-src 'self' https://eu-assets.i.posthog.com 'unsafe-inline'; style-src 'self' https://unpkg.com 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://eu-assets.i.posthog.com https://eu.i.posthog.com https://*.ingest.de.sentry.io; report-uri /csp-report"
    },
    proxy: {
      // Proxying API requests to the first backend service
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        configure: (proxy) => {
          // Apply middleware to the proxy to modify the proxied requests
          proxy.on('proxyReq', (proxyReq) => {
            // Set headers to prevent caching
            proxyReq.setHeader(
              'Cache-Control',
              'no-cache, no-store, must-revalidate'
            )
            proxyReq.setHeader('Pragma', 'no-cache')
            proxyReq.setHeader('Expires', '0')
          })
        },
      },
      // Proxying API requests to the second backend service
      '/auth': {
        target: 'http://localhost:3000',
        changeOrigin: false,
      },
    },
  },
})
