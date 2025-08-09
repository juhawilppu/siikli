import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    middlewareMode: false,
    headers: {
      'Content-Security-Policy':
        'default-src \'self\'; frame-src \'self\' blob:; script-src \'self\' https://eu-assets.i.posthog.com \'unsafe-inline\'; style-src \'self\' \'unsafe-inline\'; font-src \'self\'; img-src \'self\' data:; connect-src \'self\' https://eu-assets.i.posthog.com https://eu.i.posthog.com https://*.ingest.de.sentry.io;',
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
              'no-cache, no-store, must-revalidate',
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
