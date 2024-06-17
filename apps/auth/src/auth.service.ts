import { InvalidCredentialsException } from '@app/common';
import {
  AuthLoginRequestDto,
  AuthLoginSendRequestDto,
  AuthResponseDto,
} from '@app/dto';
import { EUserStatus, TokenPayload, User, UserStatus } from '@app/entities';
import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@/users/src/users.service';

type TokenType = 'access' | 'refresh';

@Injectable()
export class AuthService {
  public tokens: Map<string, string[]> = new Map();

  constructor(
    private readonly usersService: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
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
      throw new ForbiddenException(`Forbidden. STATUS: ${user.status.value}`);
    }
    const accessToken = await this.signToken(user);
    const refreshToken = await this.signToken(user, 'refresh');
    this.addToken(user.id, accessToken);
    return AuthResponseDto.of(accessToken, refreshToken, user);
  }

  public async signIn(
    signInCredential: AuthLoginRequestDto,
  ): Promise<AuthResponseDto> {
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

  public async logout(token: string) {
    const payload = await this.validateToken(token);
    this.resetTokens(payload.sub);
  }

  public async requestAccess(dto: AuthLoginSendRequestDto) {
    const u = await this.usersService.getByEmail(dto.login);
    if (u.isPending) {
      throw new BadRequestException('Request has already been sent!');
    }
    if (u.isActive) {
      throw new BadRequestException('user has access!');
    }
    const recipient = await this.usersService.getByEmail(dto.recipient);
    if (!recipient?.isAdmin) {
      throw new BadRequestException('Invalid recipient');
    }

    u.status = UserStatus.of(EUserStatus.PENDING);
    await this.usersService.updateUser(u);
  }
}
