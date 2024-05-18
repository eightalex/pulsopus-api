import { User } from '@app/entities';

export class TokenPayload {
  sub: User['id'];
  username: User['username'];
  roles: User['roles'];

  constructor(partial: Partial<TokenPayload>) {
    Object.assign(this, partial);
  }

  static of(user: User): typeof TokenPayload {
    const payload = new TokenPayload({
      sub: user.id,
      username: user.username,
      roles: user.roles,
    });
    return JSON.parse(JSON.stringify(payload));
  }
}
