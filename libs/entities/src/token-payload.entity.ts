import { User } from '@app/entities';

export class TokenPayload {
  sub: User['id'];
  username: User['username'];
  role: User['role'];
  status: User['status'];

  constructor(partial: Partial<TokenPayload>) {
    Object.assign(this, partial);
  }

  static of(user: User): typeof TokenPayload {
    const payload = new TokenPayload({
      sub: user.id,
      username: user.username,
      role: user.role,
      status: user.status,
    });
    return JSON.parse(JSON.stringify(payload));
  }
}
