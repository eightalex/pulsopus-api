import { User } from '@app/entities';

export class TokenPayload {
  sub: User['id'];
  username: User['username'];
  role: User['role'];
  status: User['status'];
  isActive: User['isActive'];

  constructor(partial: Partial<TokenPayload>) {
    Object.assign(this, partial);
  }

  public toPlainObject(): typeof TokenPayload {
    return JSON.parse(JSON.stringify(this));
  }

  static of(user: User): TokenPayload {
    return new TokenPayload({
      sub: user._id.toHexString(),
      username: user.username,
      role: user.role,
      status: user.status,
      isActive: user.isActive,
    });
  }

  static ofPlainObject(user: User): typeof TokenPayload {
    return TokenPayload.of(user).toPlainObject();
  }
}
