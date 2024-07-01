import { Transform, Type } from 'class-transformer';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { transformArrayFunction } from '@app/dto/helpers/transformFunction.helper';
import { EUserRole, EUserStatus } from '@app/entities';

export class UsersFilterRequestDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Type(() => String)
  @Transform((params) =>
    transformArrayFunction(params, Object.keys(EUserStatus)),
  )
  status?: EUserStatus[];

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
}
