import { User, USER_GROUP, UserDocument } from '@app/entities';
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
    user: User | UserDocument,
  ): AuthResponseDto {
    const u =
      '_doc' in user
        ? new User({
            ...(user._doc as UserDocument),
            id: user._id.toHexString(),
          })
        : user;
    return new AuthResponseDto({
      accessToken,
      refreshToken,
      user: u,
    });
  }
}
