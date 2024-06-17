import { ConfigModule, LoggerModule } from '@app/common';
import { DatabaseService } from '@app/database/database.service';
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [ConfigModule, LoggerModule],
  controllers: [UsersController],
  providers: [DatabaseService, UsersService],
  exports: [UsersService],
})
export class UsersModule {}
