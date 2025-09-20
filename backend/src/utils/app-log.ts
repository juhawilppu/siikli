import { logger } from './logger'

export const log = {
  info: (msg: string, extra?: any) => logger.info(extra ?? {}, msg),
  warn: (msg: string, extra?: any) => logger.warn(extra ?? {}, msg),
  error: (err: unknown, extra?: any) =>
    logger.error({ err, ...(extra ?? {}) }, err instanceof Error ? err.message : String(err)),
}
