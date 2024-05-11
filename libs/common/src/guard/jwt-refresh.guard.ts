import { AUTH_JWT_REFRESH_TYPE } from '@app/common';
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtRefreshGuard extends AuthGuard(AUTH_JWT_REFRESH_TYPE) {}
