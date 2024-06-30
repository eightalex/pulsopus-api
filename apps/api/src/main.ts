import * as cookieParser from 'cookie-parser';
import { Logger } from 'nestjs-pino';
import { join } from 'path';
import { HttpExceptionFilter, TokenResponseInterceptor } from '@app/common';
import {
  ClassSerializerInterceptor,
  Logger as NestLogger,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SwaggerCustomOptions } from '@nestjs/swagger/dist/interfaces/swagger-custom-options.interface';
import { AuthService } from '@/auth/src/auth.service';
import { ApiModule } from './api.module';

async function bootstrap() {
  const logger = new NestLogger();
  const app = await NestFactory.create<NestExpressApplication>(ApiModule);
  const config = app.get(ConfigService);
  const authService = app.get(AuthService);

  app.use(cookieParser());
  app.enableCors({
    allowedHeaders: '*',
    origin: '*',
  });

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

  const documentConfig = new DocumentBuilder()
    .setTitle('Pulsopus API')
    .setDescription('The Pulsopus API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, documentConfig);
  const swaggerOptions: SwaggerCustomOptions = {
    customSiteTitle: 'pulsopus | swagger',
  };
  SwaggerModule.setup('/api', app, document, swaggerOptions);

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useLogger(app.get(Logger));
  app.useGlobalInterceptors(new TokenResponseInterceptor(authService));
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      enableCircularCheck: true,
    }),
  );

  await app.listen(config.get('port.api'), async () => {
    logger.log(`Application is running on: ${await app.getUrl()}`);
  });
}

bootstrap();
