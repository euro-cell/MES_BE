import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUserId = createParamDecorator((_: unknown, context: ExecutionContext): number => {
  const req = context.switchToHttp().getRequest();
  return req.user?.id;
});

export const GetUserRole = createParamDecorator((_: unknown, context: ExecutionContext): string => {
  const req = context.switchToHttp().getRequest();
  return req.user?.role;
});
