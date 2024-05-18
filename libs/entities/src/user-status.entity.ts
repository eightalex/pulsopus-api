import { EUserStatus } from '@app/entities/constants';
import { User } from '@app/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UserStatus {
  @ApiProperty({ enum: () => EUserStatus })
  public name: EUserStatus;

  users: User[] = [];

  constructor(partial: Partial<UserStatus>) {
    Object.assign(this, partial);
  }

  static of(status: EUserStatus): UserStatus {
    return new UserStatus({ name: status });
  }
}
