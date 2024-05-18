import { ConfigModule, LoggerModule } from '@app/common';
import { Module } from '@nestjs/common';
import { MockService } from '@/api/src/mock/mock.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [ConfigModule, LoggerModule],
  controllers: [UsersController],
  providers: [UsersService, MockService],
  exports: [UsersService],
})
export class UsersModule {}
