import { Transform, Type } from 'class-transformer';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { transformArrayFunction } from '@app/dto/helpers/transformFunction.helper';
import { EUserRole } from '@app/entities';

export class UsersFilterRequestDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Type(() => String)
  @Transform((params) => transformArrayFunction(params, Object.keys(EUserRole)))
  role?: EUserRole;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Type(() => String)
  @Transform((params) => transformArrayFunction(params))
  email?: string[];

  @IsOptional()
  @Type(() => Number)
  from?: number;

  @IsOptional()
  @Type(() => Number)
  to?: number;
}
