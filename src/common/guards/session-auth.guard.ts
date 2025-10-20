import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class SessionAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const res: Response = context.switchToHttp().getResponse();

    if (!req.session?.user) {
      res.redirect('/login');
      return false;
    }
    return true;
  }
}
