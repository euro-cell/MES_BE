import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SessionRefreshMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    if (req.session?.cookie && req.isAuthenticated?.()) {
      const maxAge = req.session.cookie.originalMaxAge ?? 1000 * 60 * 30;
      const expiresAt = new Date(Date.now() + maxAge).toISOString();
      res.setHeader('X-Session-Expires', expiresAt);
    }
    next();
  }
}
