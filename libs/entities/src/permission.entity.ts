import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { EUserRole } from './constants';

export class Permission {
  @ApiProperty({ enum: () => EUserRole })
  public value: EUserRole;

  public description?: string;

  @Exclude()
  private fromRole?: EUserRole;

  constructor(partial: Partial<Permission>) {
    Object.assign(this, partial);
  }

  static of(role: EUserRole, fromRole?: EUserRole): Permission {
    const newRole = new Permission({ value: role });
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
