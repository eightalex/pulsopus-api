import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { EUserRole } from './constants';

export class Role {
  @ApiProperty({ enum: () => EUserRole })
  public value: EUserRole;

  public description?: string;

  @Exclude()
  private fromRole?: EUserRole;

  constructor(partial: Partial<Role>) {
    Object.assign(this, partial);
  }

  static of(role: EUserRole, fromRole?: EUserRole): Role {
    const newRole = new Role({ value: role });
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
