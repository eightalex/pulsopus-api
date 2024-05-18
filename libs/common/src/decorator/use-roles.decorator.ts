import { USE_ROLES_KEY } from '@app/common';
import { EUserRole } from '@app/entities';
import { SetMetadata } from '@nestjs/common';
export const UseRoles = (...roles: EUserRole[]) =>
  SetMetadata(USE_ROLES_KEY, roles);
