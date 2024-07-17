import { ConfigModule } from '@app/common';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerModule as NestMailerModule } from '@nestjs-modules/mailer';
import { MailerConfigService } from './mailer.config';
import { MailerService } from './mailer.service';

@Global()
@Module({
  imports: [
    ConfigModule,
    NestMailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useClass: MailerConfigService,
    }),
  ],
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule {}
