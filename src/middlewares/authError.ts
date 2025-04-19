import { NextFunction, Request, Response } from 'express'

export const authErrorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error('Auth error handler caught error:', {
        message: err.message,
        name: err.name,
        stack: err.stack,
        path: req.path,
        method: req.method
    })

    // Handle various authentication error cases
    if (err.name === 'UnauthorizedError' ||
        err.message.includes('Unauthorized') ||
        err.message.includes('authentication')) {
        console.log('Sending 401 response for auth error')
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'You must be logged in to access this resource',
            redirect: '/login'
        })
    }

    // If it's not an auth error, pass it to the next error handler
    console.log('Passing error to next handler:', err.message)
    next(err)
} 