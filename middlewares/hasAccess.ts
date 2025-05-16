import type { NextFunction, Request, Response } from 'express'

export async function hasAccess(req: Request, res: Response, next: NextFunction) {
  console.log('user')
  console.log(req.user)
  if (req.headers.company) {
    return next()
  }
  return res.status(403).end()
}
