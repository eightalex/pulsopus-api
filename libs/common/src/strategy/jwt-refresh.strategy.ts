import { Request, Request as RequestType } from 'express';
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
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtRefreshStrategy.extractCookieJWT,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get('secret').refresh.key,
      passReqToCallback: true,
    });
  }

  private static extractCookieJWT(req: RequestType): string | null {
    // TODO: create 'refresh' constant;
    if (req.cookies && 'refresh' in req.cookies) {
      return req.cookies.refresh;
    }
    return null;
  }

  public validate(req: Request, payload: any): { refreshToken?: string } {
    const refreshToken =
      payload || req.get('Authorization').replace('Bearer', '').trim();
    return { ...payload, refreshToken };
  }
}
