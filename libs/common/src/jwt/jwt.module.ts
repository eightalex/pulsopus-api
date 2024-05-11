import { JwtAccessGuard } from '@app/common';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule as NestJwtModule, JwtService } from '@nestjs/jwt';

@Module({
  imports: [NestJwtModule.register({ global: true })],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAccessGuard,
    },
    JwtService,
  ],
  exports: [JwtService],
})
export class JwtModule {}
