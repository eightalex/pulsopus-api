import { ExtractJwt, Strategy } from 'passport-jwt';
import { AUTH_JWT_ACCESS_TYPE } from '@app/common';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(
  Strategy,
  AUTH_JWT_ACCESS_TYPE,
) {
  constructor(private readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('secret').access.key,
    });
  }

  public async validate(payload: unknown): Promise<unknown> {
    return payload;
  }
}
