import type { NextFunction, Request, Response } from 'express'
import { log } from '../utils/app-log'

export class ErrorWithStatusCode extends Error {
  statusCode: number

  constructor(message: string, name: string, statusCode: number) {
    super(message)
    this.name = name
    this.statusCode = statusCode
  }
}

export class UnauthenticatedError extends ErrorWithStatusCode {
  constructor(message: string) {
    super(message, 'Unauthenticated', 401)
  }
}

export class ForbiddenError extends ErrorWithStatusCode {
  constructor(message: string) {
    super(message, 'Forbidden', 403)
  }
}

export class BadRequestError extends ErrorWithStatusCode {
  constructor(message: string) {
    super(message, 'BadRequest', 400)
  }
}

export class NotFoundError extends ErrorWithStatusCode {
  constructor(message: string) {
    super(message, 'NotFound', 404)
  }
}

export class UnprocessableEntityError extends ErrorWithStatusCode {
  constructor(message: string) {
    super(message, 'UnprocessableEntity', 422)
  }
}

export class InternalServerError extends ErrorWithStatusCode {
  constructor(message: string) {
    super(message, 'InternalServerError', 500)
  }
}

export function errorHandler(err: ErrorWithStatusCode, req: Request, res: Response, _next: NextFunction) {
  const logLevel = err.statusCode >= 500 ? log.error : log.warn
  logLevel('Error handler caught:', {
    tenantId: (req as any).user?.tenantId,
    userId: (req as any).user?.userId,
    exception: err.constructor.name,
    message: err.message,
    name: err.name,
    path: req.path,
    method: req.method,
  })

  return res.status(err.statusCode || 500).json({
    error: err.name || 'Internal Server Error',
    message: err.message ?? undefined,
  })
}
