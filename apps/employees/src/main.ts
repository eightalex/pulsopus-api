import * as cookieParser from 'cookie-parser';
import { Logger } from 'nestjs-pino';
import { ValidationPipe } from '@nestjs/common';
import { Logger as NestLogger } from '@nestjs/common/services/logger.service';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { EmployeesModule } from './employees.module';

async function bootstrap() {
  const logger = new NestLogger();
  const app = await NestFactory.create(EmployeesModule);
  const config = app.get(ConfigService);

  app.connectMicroservice({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: config.get('port.employees'),
    },
  });

  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  app.useLogger(app.get(Logger));

  await app.startAllMicroservices();
  await app.listen(config.get('port.employees'), async () => {
    logger.log(`Application is running on: ${await app.getUrl()}`);
  });
}
bootstrap();
