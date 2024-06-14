import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { EUserRole } from './constants';

export class UserRole {
  @ApiProperty({ enum: () => EUserRole })
  public value: EUserRole;

  public description?: string;

  @Exclude()
  private fromRole?: EUserRole;

  constructor(partial: Partial<UserRole>) {
    Object.assign(this, partial);
  }

  static of(role: EUserRole, fromRole?: EUserRole): UserRole {
    const newRole = new UserRole({ value: role });
    if (fromRole) {
      newRole.fromRole = fromRole;
    }
    return newRole;
  }

  @Expose()
  public get canSetted(): boolean {
    return this.fromRole === EUserRole.ADMIN;
  }
}
