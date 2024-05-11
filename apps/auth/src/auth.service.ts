import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthLoginRequestDto, AuthResponseDto } from '@/auth/src/dto';
import { UsersService } from '@/users/src/users.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(UsersService) private readonly usersService: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  public async signIn(dto: AuthLoginRequestDto): Promise<AuthResponseDto> {
    const user = await this.usersService.getById('id');
    const payload = { sub: 'user.id', username: 'user.username' };
    const { access } = this.config.get('secret');
    const token = await this.jwt.signAsync(payload, {
      secret: access.key,
      expiresIn: access.expire,
    });
    return new AuthResponseDto({
      accessToken: token,
      refreshToken: 'refreshToken',
    });
  }

  public async tokenLogin(token: string): Promise<AuthResponseDto> {
    console.log('token', token);
    return new AuthResponseDto({
      accessToken: token,
      refreshToken: 'refreshToken',
    });
    // const user = await this.usersService.getById('id');
    // const payload = { sub: 'user.id', username: 'user.username' };
    // const { access } = this.config.get('secret');
    // const token = await this.jwt.signAsync(payload, {
    //   secret: access.key,
    //   expiresIn: access.expire,
    // });
    // return new AuthResponseDto({
    //   accessToken: token,
    //   refreshToken: 'refreshToken',
    // });
  }
}
