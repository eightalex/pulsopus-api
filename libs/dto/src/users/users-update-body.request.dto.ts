import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { EUserRole, User } from '@app/entities';

export class UsersUpdateBodyRequestDto {
  @IsOptional()
  @IsString()
  role: EUserRole;

  @IsOptional()
  @IsBoolean()
  isActive: User['isActive'];
}
