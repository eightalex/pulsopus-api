import { LoggerModule as PinoLogerModule } from 'nestjs-pino';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    PinoLogerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
          options: {
            singleLine: true,
          },
        },
      },
    }),
  ],
})
export class LoggerModule {}
