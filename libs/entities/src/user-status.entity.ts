import { EUserStatus } from '@app/entities/constants';
import { ApiProperty } from '@nestjs/swagger';

export class UserStatus {
  @ApiProperty({ enum: () => EUserStatus })
  public value: EUserStatus;

  constructor(partial: Partial<UserStatus>) {
    Object.assign(this, partial);
  }

  static of(status: EUserStatus): UserStatus {
    return new UserStatus({ value: status });
  }
}
