import { ConfigModule, JwtModule, LoggerModule } from '@app/common';
import { DatabaseService } from '@app/database/database.service';
import { Module } from '@nestjs/common';
import { UsersService } from '@/users/src/users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [LoggerModule, ConfigModule, JwtModule],
  controllers: [AuthController],
  providers: [DatabaseService, AuthService, UsersService],
  exports: [AuthService],
})
export class AuthModule {}
