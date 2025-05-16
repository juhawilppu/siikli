import type { User } from '@prisma/client'
import type { NextFunction, Request, Response } from 'express'
import * as Sentry from '@sentry/node'

export function setSentryUser(req: Request, res: Response, next: NextFunction) {
  if (req.user) {
    const user = req.user as User
    Sentry.setUser({
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
    })
  }
  next()
}
