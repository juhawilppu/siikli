import { User } from '@prisma/client'
import express from 'express'

export const isAuthenticated = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user = req.user as User
    if (!user?.tenantId) {
        console.log('isAuthenticated - Unauthorized')
        res.status(401).json({
            error: 'Unauthorized',
            message: 'You must be logged in to access this resource',
            redirect: '/login'
        })
        return
    }
    next()
}

export const getTenantId = (req: express.Request) => {
    const user = req.user as User
    if (!user?.tenantId) {
        console.log('getTenantId - No tenant ID found')
        throw new Error(' No tenant ID found')
    }
    return user.tenantId
}