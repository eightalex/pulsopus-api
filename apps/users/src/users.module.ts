import { ConfigModule, LoggerModule } from '@app/common';
import { DatabaseModule } from '@app/database';
import { DatabaseService } from '@app/database/database.service';
import { MailerModule } from '@app/mailer';
import { Module } from '@nestjs/common';
import { AuthService } from '@/auth/src/auth.service';
import { UsersGateway } from '@/users/src/users.gateway';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [ConfigModule, LoggerModule, DatabaseModule, MailerModule],
  controllers: [UsersController],
  providers: [UsersService, UsersGateway, DatabaseService, AuthService],
  exports: [UsersService, UsersGateway],
})
export class UsersModule {}
