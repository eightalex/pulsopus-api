import { ConfigModule, LoggerModule } from '@app/common';
import { Module } from '@nestjs/common';
import { MockService } from '@/api/src/mock/mock.service';
import { UsersService } from '@/users/src/users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [ConfigModule, LoggerModule],
  controllers: [AuthController],
  providers: [AuthService, MockService, UsersService],
})
export class AuthModule {}
