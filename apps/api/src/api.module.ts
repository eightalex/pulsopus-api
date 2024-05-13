import { ConfigModule, JwtModule, LoggerModule } from '@app/common';
import { Module } from '@nestjs/common';
import { ApiController } from '@/api/src/api.controller';
import { ApiService } from '@/api/src/api.service';
import { AuthModule } from '@/auth/src/auth.module';
import { UsersModule } from '@/users/src/users.module';

@Module({
  imports: [ConfigModule, LoggerModule, JwtModule, AuthModule, UsersModule],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {}
