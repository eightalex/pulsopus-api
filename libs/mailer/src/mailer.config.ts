import { join } from 'path';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailerOptionsFactory } from '@nestjs-modules/mailer/dist/interfaces/mailer-options-factory.interface';

@Injectable()
export class MailerConfigService implements MailerOptionsFactory {
  constructor(private readonly config: ConfigService) {}

  private get templatesPagesDir(): string {
    return join(__dirname, 'templates', 'pages');
  }

  private get templatesPartialDir(): string {
    return join(__dirname, 'templates', 'partials');
  }

  createMailerOptions(): MailerOptions | Promise<MailerOptions> {
    const mailer = this.config.get('mailer');
    return {
      transport: {
        host: mailer.host,
        secure: false, // true for 465, false for other ports
        port: mailer.port,
        auth: {
          user: mailer.user,
          pass: mailer.password,
        },
      },
      defaults: {
        from: 'noreply@pulsopus.dev',
      },
      template: {
        dir: this.templatesPagesDir,
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
      options: {
        partials: {
          dir: this.templatesPartialDir,
          options: {
            strict: true,
          },
        },
      },
    };
  }
}
