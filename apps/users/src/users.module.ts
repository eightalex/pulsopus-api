import { ConfigModule } from '@app/common';
import { DatabaseModule } from '@app/database';
import { MailerModule } from '@app/mailer';
import { Module } from '@nestjs/common';
import { UsersGateway } from '@/users/src/users.gateway';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [ConfigModule, DatabaseModule, MailerModule],
  controllers: [UsersController],
  providers: [UsersService, UsersGateway],
  exports: [UsersService, UsersGateway],
})
export class UsersModule {}
