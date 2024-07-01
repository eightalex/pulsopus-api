import { Transform, Type } from 'class-transformer';
import { IsString } from 'class-validator';
import { transformArrayFunction } from '@app/dto/helpers/transformFunction.helper';
import { EAccessRequestDecision } from '@app/entities';

export class UsersAccessRequestBodyRequestDto {
  @IsString()
  @Type(() => String)
  @Transform(
    (params) =>
      transformArrayFunction(params, Object.keys(EAccessRequestDecision))[0],
  )
  decision: EAccessRequestDecision;
}
