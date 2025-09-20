import type { User } from '@prisma/client'
import type express from 'express'
import type { UserSessionFromPassport } from '../passportConfig'
import { ForbiddenError, UnauthenticatedError } from './error-handler'

export function getSessionOrThrow(req: express.Request) {
  const user = req.user as UserSessionFromPassport
  if (!user || !user?.tenantId || !user?.userId) {
    throw new UnauthenticatedError('No session information found')
  }

  return { userId: user.userId, tenantId: user.tenantId }
}

export function isOwner(req: express.Request) {
  const user = req.user as User
  if (user.role !== 'OWNER') {
    throw new ForbiddenError('Forbidden')
  }
}
