import { Exclude, Expose } from 'class-transformer';
import { EUserRole, EUserStatus } from '@app/entities/constants';
import { ApiProperty } from '@nestjs/swagger';

export class UserStatus {
  @ApiProperty({ enum: () => EUserStatus })
  public value: EUserStatus;

  @Exclude()
  private fromRole?: EUserRole;

  constructor(partial: Partial<UserStatus>) {
    Object.assign(this, partial);
  }

  static of(status: EUserStatus, fromRole?: EUserRole): UserStatus {
    const newStatus = new UserStatus({ value: status });
    if (fromRole) {
      newStatus.fromRole = fromRole;
    }
    return newStatus;
  }

  @Expose()
  public get canSetted(): boolean {
    const excludeEditedRoles = [EUserStatus.PENDING, EUserStatus.DELETED];
    let includesRole = [];
    if (this.fromRole && this.fromRole === EUserRole.ADMIN) {
      includesRole = Object.keys(EUserStatus).reduce((acc, k: EUserStatus) => {
        if (excludeEditedRoles.includes(k)) return acc;
        return [...acc, EUserStatus[k]];
      }, []);
    }
    return includesRole.includes(this.value);
  }
}
