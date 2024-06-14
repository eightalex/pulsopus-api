import { JwtAccessGuard, RoleGuard } from '@app/common/guard';
import { JwtAccessStrategy, JwtRefreshStrategy } from '@app/common/strategy';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule as NestJwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [NestJwtModule.register({ global: true }), PassportModule],
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
  ],
  exports: [JwtService],
})
export class JwtModule {}
