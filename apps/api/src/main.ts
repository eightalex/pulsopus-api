import * as cookieParser from 'cookie-parser';
import { Logger } from 'nestjs-pino';
import { join } from 'path';
import { HttpExceptionFilter, TokenResponseInterceptor } from '@app/common';
import { default as cnfg } from '@app/common/config/config';
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
  const appCtx = await NestFactory.createApplicationContext(ApiModule);
  const config = appCtx.get(ConfigService<typeof cnfg>);
  const isDev = config.get<boolean>('IS_DEV');

  // TODO: get prod origin from config
  const nestOptions = {
    cors: {
      credentials: true,
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
      // allowedHeaders: ['content-type', 'authorization', 'accept'],
      allowedHeaders: ['content-type', 'authorization'],
      origin: isDev
        ? ['http://localhost:5172', 'http://localhost:5173']
        : [
            /pulsopus\.dev$/,
            /\.pulsopus\.dev$/,
            'https://pulsopus.dev',
            'https://app.pulsopus.dev',
          ],
    },
  };
  const app = await NestFactory.create<NestExpressApplication>(
    ApiModule,
    nestOptions,
  );
  // const config = app.get(ConfigService);
  const authService = app.get(AuthService);

  app.use(cookieParser());

  app.useStaticAssets(join(__dirname, '..', '..', '..', 'static'), {
    prefix: '/public',
  });

  app.enableVersioning({
    type: VersioningType.URI,
    prefix: config.get('prefix.version'),
    defaultVersion: ['1'],
  });

  app.setGlobalPrefix(config.get('prefix.global'));

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
