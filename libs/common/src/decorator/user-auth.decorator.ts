import { Request } from 'express';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

const getCtxAuthorizationByKey = (ctx: ExecutionContext, key: string) => {
  const req = ctx.switchToHttp().getRequest<Request>();
  if (key in req.cookies) return req.cookies[key];
  return req.headers?.authorization?.split(' ')[1];
};

export const UserAuthorization = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    // TODO: create auth key constant (token/refresh ??)
    return getCtxAuthorizationByKey(ctx, 'token');
  },
);

export const UserAuthorizationRefresh = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    // TODO: create auth key constant (token/refresh ??)
    return getCtxAuthorizationByKey(ctx, 'refresh');
  },
);

export const UserLoginToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    return ctx.switchToHttp().getRequest().get('login-token');
  },
);
