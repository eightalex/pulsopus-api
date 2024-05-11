import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AUTH_JWT_REFRESH_TYPE } from '@app/common';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  AUTH_JWT_REFRESH_TYPE,
) {
  constructor(private readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('secret').refresh.key,
      passReqToCallback: true,
    });
  }

  public validate(req: Request, payload: any): { refreshToken?: string } {
    const refreshToken = req.get('Authorization').replace('Bearer', '').trim();
    return { ...payload, refreshToken };
  }
}
