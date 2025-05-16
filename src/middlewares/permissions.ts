import type { User } from '@prisma/client'
import type express from 'express'

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

export function getUser(req: express.Request) {
  const user = req.user as User
  if (!user?.tenantId) {
    console.log('getTenantId - No tenant ID found')
    throw new Error(' No tenant ID found')
  }
  return { userId: user.id, tenantId: user.tenantId }
}
