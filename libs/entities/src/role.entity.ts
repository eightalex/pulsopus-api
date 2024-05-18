import { AbstractEntity } from '@app/entities/abstract.entity';
import { ApiProperty } from '@nestjs/swagger';
import { EUserRole } from './constants';

export class UserRole extends AbstractEntity {
  @ApiProperty({ enum: () => EUserRole })
  public name: EUserRole;

  constructor(partial: Partial<UserRole>) {
    super();
    Object.assign(this, partial);
  }

  static of(role: EUserRole): UserRole {
    return new UserRole({ name: role });
  }
}
