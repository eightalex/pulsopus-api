import { IsOptional, IsString } from 'class-validator';
import { EUserRole, EUserStatus } from '@app/entities';

export class UsersUpdateBodyRequestDto {
  @IsOptional()
  @IsString()
  status?: EUserStatus;

  @IsOptional()
  @IsString()
  role: EUserRole;
}
