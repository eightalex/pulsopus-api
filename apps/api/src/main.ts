import * as cookieParser from 'cookie-parser';
import { Logger } from 'nestjs-pino';
import { join } from 'path';
import {
  Logger as NestLogger,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ApiModule } from './api.module';

async function bootstrap() {
  const logger = new NestLogger();
  const app = await NestFactory.create<NestExpressApplication>(ApiModule);
  const config = app.get(ConfigService);

  app.use(cookieParser());
  app.enableCors({
    allowedHeaders: '*',
    origin: '*',
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useLogger(app.get(Logger));

  app.useStaticAssets(join(__dirname, '..', '..', '..', 'static'), {
    prefix: '/public',
  });

  app.enableVersioning({
    type: VersioningType.URI,
    prefix: config.get('prefix.version'),
    defaultVersion: ['1'],
  });

  app.setGlobalPrefix(config.get('prefix.global'));

  app.use((req: any, res: any, next: any) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
    next();
  });

  await app.listen(config.get('port.api'), async () => {
    logger.log(`Application is running on: ${await app.getUrl()}`);
  });
}

bootstrap();
