import { TokenPayload } from '@app/entities';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserTokenPayload = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): TokenPayload => {
    const { user } = ctx.switchToHttp().getRequest();
    console.log('user', user);
    return user;
  },
);
