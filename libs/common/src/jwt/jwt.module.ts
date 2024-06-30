import { JwtAccessGuard, PermissionGuard, RoleGuard } from '@app/common/guard';
import { JwtAccessStrategy, JwtRefreshStrategy } from '@app/common/strategy';
import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule as NestJwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from '@/auth/src/auth.service';
import { UsersService } from '@/users/src/users.service';

@Module({
  imports: [
    DatabaseModule,
    NestJwtModule.register({ global: true }),
    PassportModule,
  ],
  providers: [
    JwtService,
    JwtAccessStrategy,
    JwtRefreshStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAccessGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
    AuthService,
    UsersService,
  ],
  exports: [JwtService, JwtAccessStrategy, JwtRefreshStrategy],
})
export class JwtModule {}
