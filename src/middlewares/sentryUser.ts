import { User } from '@prisma/client'
import * as Sentry from '@sentry/node'
import { NextFunction, Request, Response } from 'express'

export const setSentryUser = (req: Request, res: Response, next: NextFunction) => {
    if (req.user) {
        const user = req.user as User
        Sentry.setUser({
            id: user.id,
            tenantId: user.tenantId,
            email: user.email
        })
    }
    next()
} 