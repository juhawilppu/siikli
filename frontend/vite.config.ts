import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
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
    },
  },
})
