import { ConfigModule, LoggerModule } from '@app/common';
import { DatabaseModule } from '@app/database';
import { DatabaseService } from '@app/database/database.service';
import { MailerModule } from '@app/mailer';
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [ConfigModule, LoggerModule, DatabaseModule, MailerModule],
  controllers: [UsersController],
  providers: [UsersService, DatabaseService],
  exports: [UsersService],
})
export class UsersModule {}
