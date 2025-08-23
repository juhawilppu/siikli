import type { User } from '@prisma/client'
import type express from 'express'
import type { UserSessionFromPassport } from '../passportConfig'

export function isAuthenticated(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = req.user as User
  if (!user?.tenantId) {
    console.log('isAuthenticated - Unauthorized')
    res.status(401).json({
      error: 'Unauthorized',
      message: 'You must be logged in to access this resource',
      redirect: '/login',
    })
    return
  }
  next()
}

export function getSessionOrThrow(req: express.Request) {
  const user = req.user as UserSessionFromPassport
  console.log('user', user)
  if (!user?.tenantId) {
    console.log('getSessionOrThrow - No tenant ID found')
    throw new Error(' No tenant ID found')
  }
  if (!user?.userId) {
    console.log('getSessionOrThrow - No user ID found')
    throw new Error(' No user ID found')
  }
  return { userId: user.userId, tenantId: user.tenantId }
}

export function isOwner(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = req.user as User
  console.log('user', user)
  if (user.role !== 'OWNER') {
    res.status(403).json({ error: 'Forbidden' })
    return
  }
  next()
}
