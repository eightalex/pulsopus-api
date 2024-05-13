import { InvalidCredentialsException } from '@app/common';
import { AuthLoginRequestDto, AuthResponseDto } from '@app/dto';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@/users/src/users.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(UsersService) private readonly usersService: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  public async signIn(dto: AuthLoginRequestDto): Promise<AuthResponseDto> {
    throw new InvalidCredentialsException();
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

  public async tokenLogin(token: string): Promise<AuthResponseDto> {
    throw new InvalidCredentialsException();

    const payload = { sub: 'user.id', username: 'user.username' };
    const { access } = this.config.get('secret');
    const accessToken = await this.jwt.signAsync(payload, {
      secret: access.key,
      expiresIn: access.expire,
    });

    return new AuthResponseDto({
      accessToken,
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
