import { USE_PERMISSIONS_KEY } from '@app/common';
import { SetMetadata } from '@nestjs/common';

export interface IPermissionRequiredRule {
  action: string;
  subject: string;
  conditions?: any;
}
export const UsePermissions = (...requirements: IPermissionRequiredRule[]) =>
  SetMetadata(USE_PERMISSIONS_KEY, requirements);
