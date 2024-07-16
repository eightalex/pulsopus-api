import { join } from 'path';
import { ConfigModule } from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerModule as NestMailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailerConfigService } from './mailer.config';
import { MailerService } from './mailer.service';

@Module({
  imports: [
    ConfigModule,
    NestMailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useClass: MailerConfigService,
    }),
  ],
  // imports: [
  //   ConfigModule,
  //   NestMailerModule.forRootAsync({
  //     imports: [ConfigModule],
  //     useFactory: async (config: ConfigService) => ({
  //       transport: {
  //         host: config.get('mailer.host'),
  //         secure: false,
  //         port: config.get('mailer.port'),
  //         auth: {
  //           user: config.get('mailer.user'),
  //           pass: config.get('mailer.password'),
  //         },
  //       },
  //       template: {
  //         dir: join(__dirname, 'templates/pages'),
  //         adapter: new HandlebarsAdapter(),
  //         options: {
  //           strict: true,
  //         },
  //       },
  //       options: {
  //         partials: {
  //           dir: join(__dirname, 'templates/partials'),
  //           options: {
  //             strict: true,
  //           },
  //         },
  //       },
  //     }),
  //     inject: [ConfigService],
  //   }),
  // ],
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule {}
