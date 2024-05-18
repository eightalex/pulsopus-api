import { User, USER_GROUP } from '@app/entities';
import { SerializeOptions } from '@nestjs/common';

@SerializeOptions({ groups: [USER_GROUP.AUTH] })
export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: User;

  constructor(partial: Partial<AuthResponseDto>) {
    Object.assign(this, partial);
  }

  static of(
    accessToken: string,
    refreshToken: string,
    user: User,
  ): AuthResponseDto {
    return new AuthResponseDto({
      accessToken,
      refreshToken,
      user: user,
    });
  }
}
