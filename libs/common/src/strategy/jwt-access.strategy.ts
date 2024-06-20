import { ExtractJwt, Strategy } from 'passport-jwt';
import { AUTH_JWT_ACCESS_TYPE } from '@app/common';
import { TokenPayload } from '@app/entities';
import { Injectable, UnauthorizedException } from '@nestjs/common';
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
    try {
      const tokenPayload = await this.authService.updateTokenPayloadByUserId(
        payload.sub,
      );
      if (!tokenPayload) {
        throw new Error('Unexpected exception. No token payload!');
      }
      if (!tokenPayload.isActive) {
        throw new Error('Invalid user!');
      }
      return tokenPayload;
    } catch (err) {
      throw new UnauthorizedException(`Unauthorized. ${err.message}`);
    }
  }
}
