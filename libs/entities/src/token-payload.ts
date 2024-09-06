import { User } from '@app/entities';

export class TokenPayload {
  sub: User['id'];
  username: User['username'];
  role: User['role'];
  isActive: User['isActive'];

  constructor(partial: Partial<TokenPayload>) {
    Object.assign(this as Partial<TokenPayload>, partial);
  }

  public toPlainObject(): typeof TokenPayload {
    return JSON.parse(JSON.stringify(this));
  }

  static of(user: User): TokenPayload {
    return new TokenPayload({
      sub: user.id,
      username: user.username,
      role: user.role,
      isActive: user.isActive,
    });
  }

  static ofPlainObject(user: User): typeof TokenPayload {
    return TokenPayload.of(user).toPlainObject();
  }
}
