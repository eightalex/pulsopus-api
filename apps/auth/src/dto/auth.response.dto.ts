export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user = { id: 0, login: 'login', name: 'name' };

  constructor(partial: Partial<AuthResponseDto>) {
    Object.assign(this, partial);
  }
}
