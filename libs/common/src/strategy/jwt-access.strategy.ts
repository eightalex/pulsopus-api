import { ExtractJwt, Strategy } from 'passport-jwt';
import { AUTH_JWT_ACCESS_TYPE } from '@app/common';
import { TokenPayload } from '@app/entities';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '@/auth/src/auth.service';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(
  Strategy,
  AUTH_JWT_ACCESS_TYPE,
) {
  constructor(
    private readonly config: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('secret').access.key,
    });
  }

  public async validate(payload: TokenPayload): Promise<TokenPayload> {
    return this.authService.updateTokenPayloadByUserId(payload.sub);
  }
}
