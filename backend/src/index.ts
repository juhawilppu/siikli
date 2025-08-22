import type { Server } from 'node:http'
import * as Sentry from '@sentry/node'
import { createApp } from './app'

let server: Server | null = null

async function start() {
  const app = await createApp()
  const port = Number(process.env.PORT ?? 3000)
  server = app.listen(port, () => {
    console.log(`🚀 Server ready at http://localhost:${port}`)
  })
}

function shutdown(msg: string, code = 0) {
  if (server) {
    server.close(() => {
      console.log(msg)
      Sentry.captureMessage(msg)
      process.exit(code)
    })
  }
  else {
    console.log(msg)
    Sentry.captureMessage(msg)
    process.exit(code)
  }
}

process.once('SIGTERM', () => shutdown('Server closed gracefully (SIGTERM)', 0))
process.once('SIGINT', () => shutdown('Server closed via SIGINT', 0))

start().catch((err) => {
  console.error('Failed to start server:', err)
  Sentry.captureException(err)
  process.exit(1)
})
