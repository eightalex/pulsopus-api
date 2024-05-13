import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;
  @ApiProperty()
  refreshToken: string;
  @ApiProperty()
  user = { id: 0, login: 'login', name: 'name' };

  constructor(partial: Partial<AuthResponseDto>) {
    Object.assign(this, partial);
  }
}
