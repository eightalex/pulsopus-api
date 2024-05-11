import { ConfigModule, JwtModule, LoggerModule } from '@app/common';
import { Module } from '@nestjs/common';
import { AuthModule } from '@/auth/src/auth.module';
import { UsersModule } from '@/users/src/users.module';

@Module({
  imports: [ConfigModule, LoggerModule, JwtModule, AuthModule, UsersModule],
  controllers: [],
  providers: [],
})
export class ApiModule {}
