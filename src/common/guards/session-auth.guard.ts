import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class SessionAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    if (!req.isAuthenticated()) {
      throw new UnauthorizedException('세션이 만료되었습니다.');
    }
    return true;
  }
}
