import { IsOptional, IsString } from 'class-validator';
import { EUserRole } from '@app/entities';

export class UsersUpdateBodyRequestDto {
  @IsOptional()
  @IsString()
  role: EUserRole;
}
