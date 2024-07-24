import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserAuthorization = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    // TODO: create 'token' constant;
    if ('token' in request.cookies) return request.cookies.token;
    return request.headers?.authorization?.split(' ')[1];
  },
);

export const UserLoginToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    return ctx.switchToHttp().getRequest().get('login-token');
  },
);
