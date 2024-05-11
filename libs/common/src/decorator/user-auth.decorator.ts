import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserAuthorization = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers?.authorization?.split(' ')[1];
  },
);

export const UserLoginToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const loginToken = ctx.switchToHttp().getRequest().get('login-token');
    return loginToken;
  },
);
