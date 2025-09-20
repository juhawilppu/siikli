import type { Server } from 'node:http'
import * as Sentry from '@sentry/node'
import { createApp } from './app'
import { log } from './utils/app-log'

let server: Server | null = null

async function start() {
  const app = await createApp()
  const port = Number(process.env.PORT ?? 3000)
  server = app.listen(port, () => {
    log.info(`🚀 Server ready at http://localhost:${port}`)
  })
}

function shutdown(msg: string, code = 0) {
  if (server) {
    server.close(() => {
      log.info(msg)
      Sentry.captureMessage(msg)
      process.exit(code)
    })
  }
  else {
    log.info(msg)
    Sentry.captureMessage(msg)
    process.exit(code)
  }
}

process.once('SIGTERM', () => shutdown('Server closed gracefully (SIGTERM)', 0))
process.once('SIGINT', () => shutdown('Server closed via SIGINT', 0))

start().catch((err) => {
  log.error(err, 'Failed to start server')
  Sentry.captureException(err)
  process.exit(1)
})
