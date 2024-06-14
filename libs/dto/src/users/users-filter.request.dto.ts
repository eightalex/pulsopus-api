import { Transform, Type } from 'class-transformer';
import { TransformFnParams } from 'class-transformer/types/interfaces';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { EUserRole, EUserStatus } from '@app/entities';
const trsFunc = (params: TransformFnParams, ens: string[] = []) => {
  const { value } = params;
  if (typeof value !== 'string') return value;
  ens = ens.map((e) => e.toLowerCase());
  const spls = value.split(',');
  if (!ens.length) return spls;
  return spls.reduce((acc, s) => {
    if (!Boolean(ens.includes(s.toLowerCase()))) return acc;
    return [...acc, s];
  }, [] as string[]);
};

export class UsersFilterRequestDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Type(() => String)
  @Transform((params) => trsFunc(params, Object.keys(EUserStatus)))
  status?: EUserStatus[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Type(() => String)
  @Transform((params) => trsFunc(params, Object.keys(EUserRole)))
  role?: EUserRole;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Type(() => String)
  @Transform((params) => trsFunc(params))
  email?: string[];
}
