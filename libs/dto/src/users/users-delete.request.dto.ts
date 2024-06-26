import { Transform, Type } from 'class-transformer';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { User } from '@app/entities';
import { ApiProperty } from '@nestjs/swagger';
export class UsersDeleteRequestDto {
  @ApiProperty({ type: [User['id']] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Type(() => String)
  @Transform((params) => params.value.toString().split(','))
  ids?: User['id'][];
}
