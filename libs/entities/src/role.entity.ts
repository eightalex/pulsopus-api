import { AbstractEntity } from '@app/entities/abstract.entity';
import { ApiProperty } from '@nestjs/swagger';
import { EUserRole } from './constants';

export class UserRole extends AbstractEntity {
  @ApiProperty({ enum: () => EUserRole })
  public value: EUserRole;

  public description?: string;

  constructor(partial: Partial<UserRole>) {
    super();
    Object.assign(this, partial);
  }

  static of(role: EUserRole): UserRole {
    return new UserRole({ value: role });
  }
}
