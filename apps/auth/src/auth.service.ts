import { Response } from 'express';
import { InvalidCredentialsException } from '@app/common';
import { ms } from '@app/common/utils';
import {
  AuthLoginRequestDto,
  AuthLoginSendRequestDto,
  AuthResponseDto,
} from '@app/dto';
import { EUserRole, EUserStatus, TokenPayload, User } from '@app/entities';
import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@/users/src/users.service';

type TokenType = 'access' | 'refresh';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  public tokens: Map<string, string[]> = new Map();

  constructor(
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
    private readonly usersService: UsersService,
  ) {}

  private getSecret(key: TokenType = 'access'): {
    key: string;
    expire: string;
  } {
    const secret = this.config.get<{ key: string; expire: string }>(
      `secret.${key}`,
    );
    if (!secret) {
      throw new HttpException(
        'Unexpected exception. Invalid access config',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return secret;
  }
  private async signToken(
    user: User,
    type: TokenType = 'access',
  ): Promise<string> {
    if (!user) {
      throw new InvalidCredentialsException('Unexpected exception!');
    }

    const access = this.getSecret(type);
    return this.jwt.signAsync(TokenPayload.ofPlainObject(user), {
      secret: access.key,
      expiresIn: access.expire,
    });
  }

  private async validateUserPassword(
    user: User,
    password: string,
  ): Promise<boolean> {
    if (!user || !password) {
      throw new InvalidCredentialsException();
    }
    const validate = await user.validatePassword(password);
    if (!validate) {
      throw new InvalidCredentialsException();
    }
    return validate;
  }

  public async validateToken(
    token: string,
    type: TokenType = 'access',
  ): Promise<TokenPayload> {
    if (!token || !type) {
      throw new InvalidCredentialsException('Unexpected exception');
    }
    const { key } = this.getSecret(type);
    return this.jwt.verifyAsync(token, {
      secret: key,
    });
  }

  public async rebuildToken(
    token: string,
    type: TokenType = 'access',
  ): Promise<string> {
    const payload = await this.validateToken(token);
    const user = await this.usersService.getById(payload.sub);
    return this.signToken(user, type);
  }

  private addToken(id: string, token: string, replace?: string) {
    const map = new Map(this.tokens);
    let tkns = map.get(id) || [];
    if (replace) {
      tkns = tkns.map((t) => {
        if (t !== replace) return t;
        return token;
      });
    } else {
      tkns = [...tkns, token];
    }
    map.set(id, tkns);
    this.tokens = map;
  }

  private resetTokens(id: string) {
    const map = new Map(this.tokens);
    map.delete(id);
    this.tokens = map;
  }

  private async systemLogin(user: User): Promise<AuthResponseDto> {
    if (!user.isActive) {
      throw new ForbiddenException(`Forbidden. STATUS: ${user.status}`);
    }
    const accessToken = await this.signToken(user);
    const refreshToken = await this.signToken(user, 'refresh');
    this.addToken(user.id, accessToken);
    return AuthResponseDto.of(accessToken, refreshToken, user);
  }

  // TODO: sign or create and sign / remove
  public async signInWithCreate(
    signInCredential: AuthLoginRequestDto,
  ): Promise<AuthResponseDto> {
    let user: User | null = null;
    try {
      user = await this.usersService.getByEmail(signInCredential.login);
    } catch (err) {
      console.error(err);
      const newUser = new User({
        username: signInCredential.login.replace('@pulsopus.dev', ''),
        email: signInCredential.login,
        // email: signInCredential.login
        //   .replace('@pulsopus.dev', '')
        //   .concat('@pulsopus.dev'),
        password: 'password',
        refreshToken: 'refreshToken',
        status: EUserStatus.INACTIVE,
      });
      await this.usersService.create(newUser);
      user = await this.usersService.getByEmail(newUser.email);
    }
    return this.systemLogin(user);
  }

  public async signIn(
    signInCredential: AuthLoginRequestDto,
  ): Promise<AuthResponseDto> {
    // TODO: test code. Remove
    return this.signInWithCreate(signInCredential);
    const user = await this.usersService.getByEmail(signInCredential.login);
    await this.validateUserPassword(user, signInCredential.password);
    return this.systemLogin(user);
  }

  public async tokenLogin(token: string): Promise<AuthResponseDto> {
    const payload = await this.validateToken(token);
    //
    const t = this.tokens.get(payload.sub);
    if (!t) throw new InvalidCredentialsException('Invalid token login');
    //
    const user = await this.usersService.getById(payload.sub);
    return this.systemLogin(user);
  }

  public async tokenRefresh(refreshToken: string): Promise<AuthResponseDto> {
    // TODO: create refresh auth
    const payload = await this.validateToken(refreshToken, 'refresh');
    //
    const t = this.tokens.get(payload.sub);
    if (!t) throw new InvalidCredentialsException('Invalid token refresh');
    //
    const user = await this.usersService.getById(payload.sub);
    return this.systemLogin(user);
  }

  private async singInByUserId(userId: User['id']) {
    const user = await this.usersService.getById(userId);
    return this.systemLogin(user);
  }

  public async updateTokenPayloadByUserId(
    userId: User['id'],
  ): Promise<TokenPayload> {
    const res = await this.singInByUserId(userId);
    return TokenPayload.of(res.user);
  }

  public async logout(response: Response, token: string) {
    // TODO: cookie names from constant
    response.setHeader('Authorization', '');
    response.setHeader('Clear-Site-Data', '"cache", "storage"');
    response.cookie('refresh', '', {
      httpOnly: true,
      maxAge: 0,
    });
    response.cookie('token', '', {
      maxAge: 0,
      httpOnly: true,
    });

    const payload = await this.validateToken(token);
    this.resetTokens(payload.sub);
  }

  // TODO: create admin if not exist/ remove method
  private async getOrCreateAdminIfNotExist(
    email: User['email'],
  ): Promise<User> {
    try {
      return await this.usersService.getByEmail(email);
    } catch (err) {
      console.log('err', err);
      const newUser = new User({
        username: email,
        email,
        password: 'password',
        refreshToken: 'refreshToken',
        status: EUserStatus.ACTIVE,
        role: EUserRole.ADMIN,
      });
      await this.usersService.create(newUser);
      return await this.usersService.getByEmail(newUser.email);
    }
  }

  public async requestAccess(dto: AuthLoginSendRequestDto) {
    const u = await this.usersService.getByEmail(dto.login);
    if (u.isPending) {
      throw new BadRequestException('Request has already been sent!');
    }
    if (u.isActive) {
      throw new BadRequestException('User already has access!');
    }
    // const recipient = await this.usersService.getByEmail(dto.recipient);
    // TODO: test code/ remove
    const recipient = await this.getOrCreateAdminIfNotExist(dto.recipient);
    if (!recipient?.isAdmin) {
      throw new BadRequestException('Invalid recipient');
    }

    await this.usersService.createUserAccessRequest(u._id, recipient._id);
  }

  public setAuthResponseCookieToken(
    response: Response,
    accessToken: string,
    refreshToken?: string,
  ): void {
    const IS_DEV = this.config.get<boolean>('IS_DEV');
    // TODO: get domain from config | cookie name from constant
    const domain = IS_DEV ? 'localhost' : '.pulsopus.dev';
    const secure = !IS_DEV;
    const accessMaxAge = +ms(this.config.get('secret').access.expire || 0);
    const refreshMaxAge = +ms(this.config.get('secret').refresh.expire || 0);

    response.cookie('token', accessToken, {
      httpOnly: true,
      domain,
      secure,
      // sameSite: 'none',
      // maxAge: 3600 * 1000,
      maxAge: accessMaxAge,
    });
    if (refreshToken) {
      response.cookie('refresh', refreshToken, {
        httpOnly: true,
        domain,
        secure,
        // sameSite: 'none',
        maxAge: refreshMaxAge,
      });
    }
    response.setHeader('Authorization', `Bearer ${accessToken}`);
  }
}
