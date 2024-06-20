import { USE_PERMISSIONS_KEY, USE_PUBLIC_KEY } from '@app/common';
import { EUserRole } from '@app/entities';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(USE_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    const requiredPermissions = this.reflector.getAllAndOverride<EUserRole[]>(
      USE_PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermissions || !requiredPermissions.length) {
      return true;
    }
    return true;
    // const { user } = context.switchToHttp().getRequest();
    // return requiredRoles.includes(user.role.value);
  }
}
