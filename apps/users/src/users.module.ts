import { ConfigModule } from '@app/common';
import { DatabaseModule } from '@app/database';
import { MailerModule } from '@app/mailer';
import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from '@/auth/src/auth.module';
import { UsersGateway } from '@/users/src/users.gateway';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    MailerModule,
    // forwardRef(() => AuthModule),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersGateway],
  exports: [UsersService, UsersGateway],
})
export class UsersModule {}
