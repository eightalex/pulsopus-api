import { EUserRole } from '@app/entities';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserTokenRole = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): EUserRole => {
    const { user } = ctx.switchToHttp().getRequest();
    return user.role.value;
  },
);
